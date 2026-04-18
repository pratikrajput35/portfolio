import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: String,
    coverImage: String,
    tags: [String],
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.BlogPost ||
  mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
