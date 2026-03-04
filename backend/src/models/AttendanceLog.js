import mongoose from 'mongoose';

const attendanceLogSchema = new mongoose.Schema(
  {
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    date: { type: Date, required: true }, // normalized to start-of-day UTC
  },
  { timestamps: true }
);

attendanceLogSchema.index({ member: 1, date: 1 }, { unique: true });

export default mongoose.model('AttendanceLog', attendanceLogSchema);

