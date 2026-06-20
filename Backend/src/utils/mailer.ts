import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

/**
 * Dispatch an email to a recipient
 * 
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML body content
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    const info = await transporter.sendMail({
      from: '"Book-Club Library Hub" <noreply@bookclub.com>',
      to,
      subject,
      html,
    });
    console.log('Email sent successfully: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email alert');
  }
};
