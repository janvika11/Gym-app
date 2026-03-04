import mongoose from 'mongoose';

const gymSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Gym', gymSchema);
