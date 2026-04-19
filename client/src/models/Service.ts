import mongoose, { Schema, Document } from 'mongoose';

interface IPricingTier {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
}

export interface IService extends Document {
  title: string;
  category: 'design' | 'video' | 'other';
  description: string;
  icon: string;
  features: string[];
  pricingTiers: IPricingTier[];
  isPublished: boolean;
  order: number;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    category: { type: String, enum: ['design', 'video', 'other'], required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'FaPalette' },
    features: [{ type: String }],
    pricingTiers: [
      {
        name: String,
        price: String,
        features: [String],
        isPopular: { type: Boolean, default: false },
      },
    ],
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
