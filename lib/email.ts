import nodemailer from 'nodemailer';

// Configure email transporter
// For production, use environment variables for credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationCode(email: string, code: string, name: string) {
  // If no SMTP credentials, log the code instead (for development)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n📧 Verification Code for ${email}: ${code}\n`);
    console.log(`Name: ${name}\n`);
    return { success: true, code };
  }

  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Badger Pool - Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C5050C;">Badger Pool Verification</h2>
          <p>Hello ${name},</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, code };
  } catch (error) {
    console.error('Error sending email:', error);
    // For development, still return success and log the code
    console.log(`\n📧 Verification Code for ${email}: ${code}\n`);
    return { success: true, code };
  }
}

