import mongoose from 'mongoose';

const messageTemplateSchema = new mongoose.Schema(
  {
    name: { type: String },
    type: {
      type: String,
      enum: ['WELCOME', 'EXPIRY', 'CUSTOM'],
      required: true,
    },
    content: { type: String, default: '' },
    gym: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
    },
  },
  { timestamps: true }
);

messageTemplateSchema.index({ gym: 1, type: 1 });

export default mongoose.model('MessageTemplate', messageTemplateSchema);
