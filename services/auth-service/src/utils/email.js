import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Your verification code',
    html: `
      <h2>Verification Code</h2>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This code expires in ${process.env.OTP_EXPIRES_MINUTES} minutes.</p>
    `,
  };

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV] OTP for ${to}: ${otp}`);
    return { messageId: 'dev-mode' };
  }

  return getTransporter().sendMail(mailOptions);
}

export async function sendPasswordResetEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'TZW LTD — Password Reset Code',
    html: `
      <h2>Password Reset</h2>
      <p>Your reset OTP is: <strong>${otp}</strong></p>
      <p>This code expires in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes.</p>
    `,
  };

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV] Password reset OTP for ${to}: ${otp}`);
    return { messageId: 'dev-mode' };
  }

  return getTransporter().sendMail(mailOptions);
}
