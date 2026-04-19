import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: mongoose.Types.ObjectId;
  coverImage: string;
  images: string[];
  gallery?: { url: string; type: 'image' | 'video' }[];
  videoUrl?: string;
  videoPublicId?: string;
  client?: string;
  clientLogo?: string;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  order: number;
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    coverImage: { type: String, required: true },
    images: [{ type: String }],
    gallery: [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
    videoUrl: { type: String },
    videoPublicId: { type: String },
    client: { type: String },
    clientLogo: { type: String },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
