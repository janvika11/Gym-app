import express from 'express';
import AttendanceLog from '../models/AttendanceLog.js';

const router = express.Router();

function normalizeDate(date) {
  const d = date ? new Date(date) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Record a check-in for a member for a given day
router.post('/check-in', async (req, res) => {
  try {
    const { memberId, date } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: 'memberId is required' });
    }
    const day = normalizeDate(date);

    await AttendanceLog.findOneAndUpdate(
      { member: memberId, date: day },
      { $setOnInsert: { member: memberId, date: day } },
      { upsert: true, new: true }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove today's check-in for a member (mark absent)
router.delete('/check-in', async (req, res) => {
  try {
    const { memberId, date } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: 'memberId is required' });
    }
    const day = normalizeDate(date);

    await AttendanceLog.deleteOne({ member: memberId, date: day });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get counts per day for a month
router.get('/month', async (req, res) => {
  try {
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10); // 1-12
    if (!year || !month) {
      return res.status(400).json({ message: 'year and month are required' });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const logs = await AttendanceLog.aggregate([
      {
        $match: {
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    for (const row of logs) {
      const d = new Date(row._id);
      const day = d.getDate();
      result[day] = row.count;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get members checked in today
router.get('/today', async (req, res) => {
  try {
    const now = new Date();
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const logs = await AttendanceLog.find({ date: day }).select('member');
    const memberIds = logs.map((l) => String(l.member));

    res.json(memberIds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get counts per hour for today
router.get('/today-hours', async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const logs = await AttendanceLog.find({
      createdAt: { $gte: start, $lt: end },
    }).select('createdAt');

    const result = {};
    for (const log of logs) {
      const hourIST = Number(
        log.createdAt.toLocaleString('en-IN', {
          hour: '2-digit',
          hour12: false,
          timeZone: 'Asia/Kolkata',
        })
      );
      result[hourIST] = (result[hourIST] || 0) + 1;
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

