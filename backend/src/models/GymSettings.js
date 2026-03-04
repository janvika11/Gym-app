import mongoose from 'mongoose';

const gymSettingsSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, unique: true },
    welcomeMessage: {
      type: String,
      default: 'Hi {name}, welcome to our gym! We\'re excited to have you. 💪',
    },
    feeReminderMessage: {
      type: String,
      default: 'Hi {name}! Your gym membership fee of ₹{fee} is due on {date}. Please make the payment to continue your fitness journey. 💪',
    },
    overdueMessage: {
      type: String,
      default: 'Hi {name}! Your gym membership fee is overdue. Please clear your dues to continue enjoying our facilities. 💪',
    },
    expiringMessage: {
      type: String,
      default: 'Hi {name}! Your membership is expiring soon. Renew now to keep your progress going. 🏋️',
    },
    inactiveMessage: {
      type: String,
      default: 'Hi {name}! We haven\'t seen you at the gym in a while. Come back and crush your goals! 💪',
    },
  },
  { timestamps: true }
);

export default mongoose.model('GymSettings', gymSettingsSchema);
