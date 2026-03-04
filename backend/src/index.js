import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import Admin from './models/Admin.js';
import Plan from './models/Plan.js';
import authRoutes from './routes/auth.js';
import membersRoutes from './routes/members.js';
import plansRoutes from './routes/plans.js';
import remindersRoutes from './routes/reminders.js';
import statsRoutes from './routes/stats.js';
import attendanceRoutes from './routes/attendance.js';

await connectDB();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Seed default admin if env set and no admin exists
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const exists = await Admin.findOne({ email });
  if (!exists) {
    await Admin.create({ email, password, name: 'Admin' });
    console.log('Default admin created:', email);
  }
}
await seedAdmin();

// Seed default plans for demo (Basic / Premium / Gold)
async function seedPlans() {
  const defaults = [
    {
      name: 'Basic',
      durationDays: 30,
      price: 1500,
      description: 'Gym floor access, locker room, water cooler',
      active: true,
    },
    {
      name: 'Premium',
      durationDays: 30,
      price: 2500,
      description: 'Everything in Basic plus group classes and diet plan',
      active: true,
    },
    {
      name: 'Gold',
      durationDays: 30,
      price: 3500,
      description: 'Premium plus personal trainer and sauna access',
      active: true,
    },
  ];

  // Remove old generic "Monthly" seed if present
  await Plan.deleteMany({ name: /monthly/i });

  for (const def of defaults) {
    await Plan.findOneAndUpdate(
      { name: def.name },
      { $set: def },
      { upsert: true, new: true }
    );
  }
}
await seedPlans();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
