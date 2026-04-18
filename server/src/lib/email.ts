import nodemailer from 'nodemailer';

export function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendContactNotification(data: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"Portfolio Contact" <${process.env.CONTACT_RECEIVER}>`,
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
  });
}
