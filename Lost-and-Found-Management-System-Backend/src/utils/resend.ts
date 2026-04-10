import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  }
});

export async function sendLoginOtp(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Back2u" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
}