import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  role?: string;
  company?: string;
  content: string;
  avatar?: string;
  rating?: number;
  isPublished: boolean;
  order: number;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    role: String,
    company: String,
    content: { type: String, required: true },
    avatar: String,
    rating: { type: Number, min: 1, max: 5 },
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Testimonial ||
  mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
