import express from 'express';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import ReminderLog from '../models/ReminderLog.js';
import { authMiddleware } from '../middleware/auth.js';
import { gymFilter } from '../utils/gymFilter.js';

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const filter = gymFilter(req.admin);
    const members = await Member.find(filter).populate('plan');

    const activeMembers = members.filter((m) => m.active !== false).length;

    const totalRevenue = members.reduce((sum, m) => {
      if (m.plan && m.paymentStatus === 'paid') {
        return sum + (m.plan.price || 0);
      }
      return sum;
    }, 0);

    const today = new Date();
    const overdueMembers = members.filter((m) => {
      if (!m.plan) return false;
      // Match Members page: inactive => expired, past endDate => overdue
      if (m.active === false) return true;
      if (m.endDate) {
        const end = new Date(m.endDate);
        if (end < today) return true;
      }
      // Also treat explicit paymentStatus flag as overdue
      return m.paymentStatus === 'overdue';
    });
    const pendingDues = overdueMembers.reduce(
      (sum, m) => sum + (m.plan.price || 0),
      0
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthMembers = members.filter(
      (m) => m.startDate && m.startDate >= startOfMonth
    ).length;

    const totalMembers = members.length || 1;
    const avgAttendance =
      (members.filter((m) => m.lastCheckInAt && m.lastCheckInAt >= startOfMonth)
        .length /
        totalMembers) *
      100;

    const recentActivity = await ReminderLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      activeMembers,
      totalRevenue,
      pendingDues,
      overdueCount: overdueMembers.length,
      monthMembers,
      avgAttendance: Math.round(avgAttendance),
      recentActivity,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

