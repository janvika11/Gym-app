import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'paid',
    },
    active: { type: Boolean, default: true },
    lastCheckInAt: { type: Date },
    notes: { type: String },
    welcomeSent: { type: Boolean },
    welcomeError: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Member', memberSchema);
