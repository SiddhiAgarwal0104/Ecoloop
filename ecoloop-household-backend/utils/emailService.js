const https = require('https');

/**
 * Email Service - Uses Brevo HTTP API (works on Render free tier)
 * No SMTP - pure HTTP API call
 *
 * Required ENV vars:
 *   BREVO_API_KEY - from Brevo dashboard → Transactional → SMTP & API → API Settings
 */

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTPEmail = async (email, otp, purpose = 'verify') => {
  const isReset = purpose === 'reset';

  const subject = isReset
    ? '🔑 EcoLoop - Password Reset OTP'
    : '✅ EcoLoop - Verify Your Email';

  const title = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const message = isReset
    ? 'You requested a password reset. Use the OTP below to set a new password.'
    : 'Thanks for joining EcoLoop! Use the OTP below to verify your email address.';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #16a34a, #166534); padding: 32px; text-align: center; }
        .header h1 { color: #fff; margin: 0; font-size: 24px; }
        .header p { color: #bbf7d0; margin: 8px 0 0; font-size: 14px; }
        .body { padding: 32px; }
        .body p { color: #374151; font-size: 15px; line-height: 1.6; }
        .otp-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 10px; text-align: center; padding: 24px; margin: 24px 0; }
        .otp-code { font-size: 40px; font-weight: 900; letter-spacing: 8px; color: #15803d; }
        .otp-label { font-size: 12px; color: #6b7280; margin-top: 8px; }
        .warning { font-size: 13px; color: #9ca3af; margin-top: 24px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>♻️ EcoLoop</h1>
          <p>${title}</p>
        </div>
        <div class="body">
          <p>${message}</p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-label">This OTP expires in 10 minutes</div>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
          <p class="warning">⚠️ Never share this OTP with anyone. EcoLoop will never ask for your OTP.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} EcoLoop. Making the world greener, one step at a time.
        </div>
      </div>
    </body>
    </html>
  `;

  const payload = JSON.stringify({
    sender: { name: 'EcoLoop', email: 'bingo7815@gmail.com' },
    to: [{ email }],
    subject,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.brevo.com',
        path: '/v3/smtp/email',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`Brevo API error: ${res.statusCode} - ${data}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

module.exports = { generateOTP, sendOTPEmail };