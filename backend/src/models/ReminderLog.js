import mongoose from 'mongoose';

const reminderLogSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    memberName: { type: String },
    phone: { type: String },
    title: { type: String },
    body: { type: String },
    status: {
      type: String,
      enum: ['sent', 'failed'],
      default: 'sent',
    },
    errorMessage: { type: String },
    providerMessageId: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('ReminderLog', reminderLogSchema);

