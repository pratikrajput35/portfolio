import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    // Save to database
    const submission = db.create('contacts', { ...data, isRead: false });

    // Send email notification
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false, // true for 465, false for 587
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Portfolio Contact" <${process.env.CONTACT_RECEIVER}>`, // Use verified sender
        to: process.env.CONTACT_RECEIVER,
        replyTo: data.email,
        subject: `New Contact Form Submission: ${data.subject || 'No Subject'}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #f97316;">New Message from Portfolio</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Subject:</strong> ${data.subject || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 10px;">
              ${data.message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // We don't return 500 here because the message WAS saved to the database successfully.
    }

    return NextResponse.json({ success: true, id: (submission as any)._id });
  } catch (error) {
    console.error('Contact form critical error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
