import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  slug: string;
  shortDescription?: string;
  description: string;
  category: mongoose.Types.ObjectId;
  coverImage?: string;
  images: string[];
  gallery: Array<{ url: string; type: 'image' | 'video' }>;
  videoUrl?: string;
  videoProvider?: 'youtube' | 'drive' | null;
  googleDriveLink?: string;
  client?: string;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  order: number;
}

const ProjectSchema = new Schema<IProject>(
  {
    title:            { type: String, required: true },
    slug:             { type: String, required: true, unique: true },
    shortDescription: String,
    description:      { type: String, required: true },
    category:         { type: Schema.Types.ObjectId, ref: 'Category' },
    coverImage:       String,
    images:           [String],
    gallery:          [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
    // External video support — only URLs stored, no media in Cloudinary/MongoDB
    videoUrl:         String,
    videoProvider:    { type: String, enum: ['youtube', 'drive', null], default: null },
    // Kept for backward compatibility
    googleDriveLink:  String,
    client:           String,
    tags:             [String],
    isFeatured:       { type: Boolean, default: false },
    isPublished:      { type: Boolean, default: true },
    order:            { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Project ||
  mongoose.model<IProject>('Project', ProjectSchema);
