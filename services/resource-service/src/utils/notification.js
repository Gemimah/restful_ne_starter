import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendInspectionNotification({ to, serialNumber, location, scheduledDate, scheduledTime }) {
  const dateStr = new Date(scheduledDate).toLocaleDateString();
  const html = `
    <h2>TZW LTD — Inspection Scheduled</h2>
    <p>A fire extinguisher inspection has been scheduled.</p>
    <ul>
      <li><strong>Serial:</strong> ${serialNumber}</li>
      <li><strong>Location:</strong> ${location}</li>
      <li><strong>Date:</strong> ${dateStr}</li>
      <li><strong>Time:</strong> ${scheduledTime}</li>
    </ul>
  `;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[DEV] Inspection notification for ${to}: ${serialNumber} on ${dateStr} at ${scheduledTime}`);
    return;
  }

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'TZW LTD <noreply@tzw.com>',
    to,
    subject: 'Fire Extinguisher Inspection Scheduled',
    html,
  });
}
