import mongoose from 'mongoose';

const customTemplateSchema = new mongoose.Schema(
  {
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true, unique: true },
    templates: { type: String, default: '[]' },
  },
  { timestamps: true }
);

export default mongoose.model('CustomTemplate', customTemplateSchema);
