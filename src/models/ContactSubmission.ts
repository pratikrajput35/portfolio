import mongoose, { Schema, Document } from 'mongoose';

export interface IContactSubmission extends Document {
  name: string;
  email: string;
  subject?: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.ContactSubmission ||
  mongoose.model<IContactSubmission>('ContactSubmission', ContactSubmissionSchema);
