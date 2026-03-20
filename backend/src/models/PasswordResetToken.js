import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    userType: { type: String, required: true, enum: ['gym', 'admin'], index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('PasswordResetToken', passwordResetTokenSchema);

