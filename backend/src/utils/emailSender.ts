// backend/src/utils/emailSender.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurare transporter Nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Trimite un email
 */
export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to: ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Generează și trimite un email de resetare a parolei
 */
export const sendPasswordResetEmail = async (
  to: string,
  username: string,
  resetToken: string,
  expiryTime: number = 60 // Default 60 minute
): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
      <h2 style="color: #8B5A2B; text-align: center;">Westin - Resetare Parolă</h2>
      <p>Salut, <strong>${username}</strong>!</p>
      <p>Am primit o solicitare de resetare a parolei contului tău Westin. Pentru a-ți resetarea parola, te rugăm să accesezi link-ul de mai jos:</p>
      <p style="text-align: center;">
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #8B5A2B; color: #fff; text-decoration: none; border-radius: 5px;">Resetează Parola</a>
      </p>
      <p>Sau accesează acest link: <a href="${resetUrl}">${resetUrl}</a></p>
      <p>Link-ul va expira în ${expiryTime} minute.</p>
      <p>Dacă nu ai cerut tu resetarea parolei, te rugăm să ignori acest email.</p>
      <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
        &copy; 2025 Westin - Unde Vestul întâlnește Orientul
      </p>
    </div>
  `;

  const subject = 'Westin - Resetare Parolă';
  
  await sendEmail(to, subject, html);
};