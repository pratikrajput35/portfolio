import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimonial extends Document {
  name: string;
  role: string;
  company?: string;
  avatar?: string;
  content: string;
  rating: number;
  isPublished: boolean;
  order: number;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    company: { type: String },
    avatar: { type: String },
    content: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
