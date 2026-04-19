import express from 'express';
import { google } from 'googleapis';
import User from '../models/User.js';
import Email from '../models/Email.js';
import SpamClassifier from '../services/spamClassifier.js';

const router = express.Router();

const getOauth2Client = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken
  });
  return oauth2Client;
};

// Middleware to check authentication and attach User object
const requireAuth = async (req, res, next) => {
  const userId = req.headers.authorization?.split(' ')[1]; // Expecting "Bearer <userId>"
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error check auth' });
  }
};

router.post('/sync', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const oauth2Client = getOauth2Client(user);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch latest messages (limit 20 for now)
    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 20
    });

    const messages = listRes.data.messages || [];
    let syncedCount = 0;

    for (const msg of messages) {
      // Check if already in DB
      const existing = await Email.findOne({ user: user._id, messageId: msg.id });
      if (existing) continue;

      const detailsRes = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id
      });
      const data = detailsRes.data;

      const headers = data.payload.headers;
      let subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      let sender = headers.find(h => h.name === 'From')?.value || 'Unknown';
      let date = headers.find(h => h.name === 'Date')?.value || new Date();

      // Extract parts to find text content
      let content = '';
      let htmlContent = '';
      if (data.payload.parts) {
        data.payload.parts.forEach(part => {
          if (part.mimeType === 'text/plain' && part.body.data) {
            content += Buffer.from(part.body.data, 'base64').toString('utf8');
          }
          if (part.mimeType === 'text/html' && part.body.data) {
            htmlContent += Buffer.from(part.body.data, 'base64').toString('utf8');
          }
        });
      } else if (data.payload.body.data) {
        content = Buffer.from(data.payload.body.data, 'base64').toString('utf8');
        if (data.payload.mimeType === 'text/html') htmlContent = content;
      }

      // If no plain text, use snippet or strip html
      if (!content) content = data.snippet;

      // Classify the email
      const classification = SpamClassifier.classify(subject, content || htmlContent);

      const emailObj = new Email({
        user: user._id,
        messageId: msg.id,
        threadId: msg.threadId,
        subject,
        sender,
        date: new Date(date),
        snippet: data.snippet,
        content: htmlContent || content, // Store HTML if available for better display
        isSpam: classification.isSpam,
        spamScore: classification.spamScore,
        spamReason: classification.reason
      });

      await emailObj.save();
      syncedCount++;
    }

    user.lastSynced = new Date();
    await user.save();

    res.json({ message: 'Sync complete', newEmails: syncedCount });
  } catch (error) {
    console.error('Gmail sync error:', error.message);
    res.status(500).json({ error: 'Failed to sync emails from Gmail' });
  }
});

router.get('/inbox', requireAuth, async (req, res) => {
  try {
    const emails = await Email.find({ user: req.user._id, isSpam: false }).sort('-date');
    res.json(emails);
  } catch (err) { res.status(500).json({ error: 'error fetching inbox' }); }
});

router.get('/spam', requireAuth, async (req, res) => {
  try {
    const emails = await Email.find({ user: req.user._id, isSpam: true }).sort('-date');
    res.json(emails);
  } catch (err) { res.status(500).json({ error: 'error fetching spam' }); }
});

router.delete('/spam', requireAuth, async (req, res) => {
  try {
    await Email.deleteMany({ user: req.user._id, isSpam: true });
    res.json({ message: 'Spam empty' });
  } catch (err) { res.status(500).json({ error: 'error emptying spam' }); }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const email = await Email.findOne({ user: req.user._id, _id: req.params.id });
    if (!email) return res.status(404).json({ error: 'not found' });
    
    // Mark as read
    email.read = true;
    await email.save();
    
    res.json(email);
  } catch (err) { res.status(500).json({ error: 'error reading email' }); }
});

export default router;
