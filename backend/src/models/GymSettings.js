import mongoose from 'mongoose';

const defaultWelcome = "Hi {name}, welcome to our gym! We're excited to have you. 💪";
const defaultFeeReminder = 'Hi {name}! Your gym membership fee of ₹{fee} is due on {date}. Please make the payment to continue your fitness journey. 💪';
const defaultOverdue = 'Hi {name}! Your gym membership fee is overdue. Please clear your dues to continue enjoying our facilities. 💪';
const defaultExpiring = 'Hi {name}! Your membership is expiring soon. Renew now to keep your progress going. 🏋️';
const defaultInactive = "Hi {name}! We haven't seen you at the gym in a while. Come back and crush your goals! 💪";

const gymSettingsSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, unique: true },
    welcomeTitle: { type: String, default: 'Welcome (new member)' },
    welcomeMessage: { type: String, default: defaultWelcome },
    feeReminderTitle: { type: String, default: 'Fee reminder' },
    feeReminderMessage: { type: String, default: defaultFeeReminder },
    overdueTitle: { type: String, default: 'Overdue' },
    overdueMessage: { type: String, default: defaultOverdue },
    expiringTitle: { type: String, default: 'Expiring soon' },
    expiringMessage: { type: String, default: defaultExpiring },
    inactiveTitle: { type: String, default: 'Inactive (7+ days)' },
    inactiveMessage: { type: String, default: defaultInactive },
    customTemplatesJson: { type: String, default: '[]' },
    openingTime: { type: String, default: '06:00' },
    closingTime: { type: String, default: '21:00' },
  },
  { timestamps: true }
);

export default mongoose.model('GymSettings', gymSettingsSchema);
