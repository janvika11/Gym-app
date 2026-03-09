import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const defaultWelcome = 'Hi {name}, welcome to {gym}! 💪';

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    welcomeMessage: { type: String, default: defaultWelcome },
    whatsapp: {
      phoneNumberId: { type: String },
      businessAccountId: { type: String },
      accessToken: { type: String },
      phoneNumber: { type: String },
      verified: { type: Boolean, default: false },
      templateName: { type: String },
      templateLang: { type: String },
    },
  },
  { timestamps: true }
);

gymSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

gymSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('Gym', gymSchema);
