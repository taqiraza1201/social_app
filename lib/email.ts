import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || `TikTok Coins <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your TikTok Coins account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Verify Your Account</title>
        </head>
        <body style="background:#0f0f0f;color:#ffffff;font-family:Arial,sans-serif;margin:0;padding:40px 20px;">
          <div style="max-width:480px;margin:0 auto;background:#1a1a2e;border-radius:16px;padding:40px;border:1px solid #2d2d4e;">
            <div style="text-align:center;margin-bottom:32px;">
              <span style="font-size:48px;">🎵</span>
              <h1 style="color:#fe2c55;margin:8px 0;font-size:28px;">TikTok Coins</h1>
            </div>
            <h2 style="color:#ffffff;margin-bottom:16px;font-size:20px;">Verify your email</h2>
            <p style="color:#9ca3af;margin-bottom:24px;line-height:1.6;">
              Enter the following code to verify your TikTok Coins account. This code expires in 10 minutes.
            </p>
            <div style="background:#0f0f0f;border:2px solid #fe2c55;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <span style="font-size:40px;font-weight:bold;letter-spacing:8px;color:#fe2c55;">${otp}</span>
            </div>
            <p style="color:#6b7280;font-size:13px;text-align:center;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}
