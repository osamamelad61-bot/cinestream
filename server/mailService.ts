import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn("SMTP configuration missing. Emails will be logged to console instead.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
};

export const sendEmail = async (options: MailOptions) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || "notifications@movieapp.com";

  if (!transporter) {
    console.log("--- MOCK EMAIL ---");
    console.log(`From: ${from}`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body: ${options.text}`);
    console.log("------------------");
    return { success: true, mock: true };
  }

  try {
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
};
