import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import Admin from './models/Admin.js';
import Gym from './models/Gym.js';
import GymSettings from './models/GymSettings.js';
import Plan from './models/Plan.js';
import Member from './models/Member.js';
import ReminderLog from './models/ReminderLog.js';
import authRoutes from './routes/auth.js';
import membersRoutes from './routes/members.js';
import plansRoutes from './routes/plans.js';
import remindersRoutes from './routes/reminders.js';
import statsRoutes from './routes/stats.js';
import attendanceRoutes from './routes/attendance.js';
import configRoutes from './routes/config.js';
import settingsRoutes from './routes/settings.js';

await connectDB();

// Migration: assign gym to legacy admins/data
async function migrateGyms() {
  const adminsWithoutGym = await Admin.find({ gym: { $exists: false } }).limit(1);
  if (adminsWithoutGym.length === 0) return;
  const gym = await Gym.create({ name: 'Gym App' });
  await GymSettings.create({ gym: gym._id });
  await Admin.updateMany({ gym: { $exists: false } }, { gym: gym._id });
  await Member.updateMany({ gym: { $exists: false } }, { gym: gym._id });
  await Plan.updateMany({ gym: { $exists: false } }, { gym: gym._id });
  await ReminderLog.updateMany({ gym: { $exists: false } }, { gym: gym._id });
  console.log('Migration: assigned default gym to legacy data');
}
await migrateGyms();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/plans', plansRoutes);
app.use('/api/reminders', remindersRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/config', configRoutes);
app.use('/api/settings', settingsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

// Seed default admin if env set and no admin exists
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  const exists = await Admin.findOne({ email });
  if (!exists) {
    const gym = await Gym.create({ name: 'Gym App' });
    await GymSettings.create({ gym: gym._id });
    await Admin.create({ gym: gym._id, email, password, name: 'Admin' });
    console.log('Default admin created:', email);
  }
}
await seedAdmin();

// Seed default plans per gym (Basic / Premium / Gold)
async function seedPlans() {
  const gyms = await Gym.find();
  const defaults = [
    { name: 'Basic', durationDays: 30, price: 1500, description: 'Gym floor access, locker room, water cooler', active: true },
    { name: 'Premium', durationDays: 30, price: 2500, description: 'Everything in Basic plus group classes and diet plan', active: true },
    { name: 'Gold', durationDays: 30, price: 3500, description: 'Premium plus personal trainer and sauna access', active: true },
  ];
  for (const gym of gyms) {
    await Plan.deleteMany({ gym: gym._id, name: /monthly/i });
    for (const def of defaults) {
      await Plan.findOneAndUpdate(
        { gym: gym._id, name: def.name },
        { $set: { ...def, gym: gym._id } },
        { upsert: true, new: true }
      );
    }
  }
}
await seedPlans();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
