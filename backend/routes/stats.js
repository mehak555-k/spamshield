import express from 'express';
import Email from '../models/Email.js';
import User from '../models/User.js';

const router = express.Router();

const requireAuth = async (req, res, next) => {
  const userId = req.headers.authorization?.split(' ')[1];
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

router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const totalEmails = await Email.countDocuments({ user: userId });
    const spamEmails = await Email.countDocuments({ user: userId, isSpam: true });
    const hamEmails = await Email.countDocuments({ user: userId, isSpam: false });

    // Aggregate by date (last 7 days example)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Email.aggregate([
      { $match: { user: userId, date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          spam: { $sum: { $cond: [{ $eq: ["$isSpam", true] }, 1, 0] } },
          ham: { $sum: { $cond: [{ $eq: ["$isSpam", false] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for Recharts
    const chartData = dailyStats.map(stat => ({
      date: stat._id,
      spam: stat.spam,
      ham: stat.ham
    }));

    res.json({
      totalEmails,
      spamEmails,
      hamEmails,
      accuracy: 94.5, // Mock accuracy for now, or calculate based on model confidence avg
      chartData
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
