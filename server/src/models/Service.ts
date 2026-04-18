import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  icon?: string;
  price?: string;
  features: string[];
  isPublished: boolean;
  order: number;
}

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: String,
    price: String,
    features: [String],
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Service ||
  mongoose.model<IService>('Service', ServiceSchema);
