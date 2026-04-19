import express from 'express';
import { google } from 'googleapis';
import User from '../models/User.js';

const router = express.Router();

const getOauth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
};

router.get('/google', (req, res) => {
  const oauth2Client = getOauth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify'
    ],
    prompt: 'consent' // Force to get refresh token
  });
  res.json({ url });
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const oauth2Client = getOauth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    
    let user = await User.findOne({ googleId: data.id });
    if (!user) {
      user = new User({
        googleId: data.id,
        email: data.email,
        displayName: data.name,
        profileImage: data.picture,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      });
    } else {
      user.accessToken = tokens.access_token;
      if (tokens.refresh_token) {
        user.refreshToken = tokens.refresh_token;
      }
    }
    await user.save();
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = new URL(`${frontendUrl}/login`);
    redirectUrl.searchParams.append('token', tokens.access_token);
    redirectUrl.searchParams.append('userId', user._id);
    if (user.displayName) redirectUrl.searchParams.append('name', user.displayName);
    if (user.email) redirectUrl.searchParams.append('email', user.email);
    if (user.profileImage) redirectUrl.searchParams.append('picture', user.profileImage);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('Google callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});

export default router;
