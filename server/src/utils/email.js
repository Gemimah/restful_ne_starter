import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: false,
      auth: {
        user: env.smtp.user,
        pass: env.smtp.pass,
      },
    });
  }
  return transporter;
}

export async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: env.smtp.from,
    to,
    subject: 'Your verification code',
    html: `
      <h2>Verification Code</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This code expires in ${env.otp.expiresMinutes} minutes.</p>
    `,
  };

  if (!env.smtp.user || !env.smtp.pass) {
    console.log(`[DEV] OTP for ${to}: ${otp}`);
    return { messageId: 'dev-mode' };
  }

  return getTransporter().sendMail(mailOptions);
}
