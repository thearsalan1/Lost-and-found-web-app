import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587
,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
});

transporter.verify((error) => {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
  }
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Back2u" <${process.env.EMAIL_SENDER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};