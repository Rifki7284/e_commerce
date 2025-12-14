import nodemailer from "nodemailer";

export async function sendOtpEmail(email: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"GameKeys" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your GameKeys Account - OTP Code",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background: linear-gradient(to bottom, #1e293b, #0f172a); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);">
                      <div style="display: inline-block; width: 60px; height: 60px; background: rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                        </svg>
                      </div>
                      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">GameKeys</h1>
                      <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">Secure Digital Game Store</p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px; color: #ffffff; font-size: 24px; font-weight: 600;">Verify Your Email Address</h2>
                      <p style="margin: 0 0 24px; color: #cbd5e1; font-size: 16px; line-height: 1.6;">
                        Thank you for registering with GameKeys! To complete your registration and secure your account, please use the verification code below:
                      </p>

                      <!-- OTP Box -->
                      <table role="presentation" style="width: 100%; margin: 32px 0;">
                        <tr>
                          <td style="text-align: center;">
                            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 24px; display: inline-block;">
                              <p style="margin: 0 0 8px; color: #93c5fd; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                              <div style="font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                                ${otp}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Info Box -->
                      <div style="background: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
                        <p style="margin: 0; color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                          <strong style="color: #ffffff;">⏱️ Important:</strong> This code will expire in <strong style="color: #60a5fa;">5 minutes</strong>. Please complete your verification promptly.
                        </p>
                      </div>

                      <p style="margin: 24px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                        If you didn't create an account with GameKeys, please ignore this email or contact our support team if you have concerns.
                      </p>
                    </td>
                  </tr>

                  <!-- Security Notice -->
                  <tr>
                    <td style="padding: 0 40px 40px;">
                      <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px;">
                        <p style="margin: 0; color: #fca5a5; font-size: 13px; line-height: 1.6;">
                          <strong>🔒 Security Tip:</strong> GameKeys will never ask you to share your verification code with anyone. Keep it confidential.
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 32px 40px; background: rgba(15, 23, 42, 0.8); border-top: 1px solid rgba(59, 130, 246, 0.2);">
                      <table role="presentation" style="width: 100%;">
                        <tr>
                          <td style="text-align: center;">
                            <p style="margin: 0 0 16px; color: #64748b; font-size: 14px;">
                              Need help? Contact us at 
                              <a href="mailto:support@gamekeys.com" style="color: #3b82f6; text-decoration: none;">support@gamekeys.com</a>
                            </p>
                            <div style="margin: 16px 0;">
                              <a href="#" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; font-size: 12px;">Privacy Policy</a>
                              <span style="color: #475569;">•</span>
                              <a href="#" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; font-size: 12px;">Terms of Service</a>
                              <span style="color: #475569;">•</span>
                              <a href="#" style="display: inline-block; margin: 0 8px; color: #64748b; text-decoration: none; font-size: 12px;">Help Center</a>
                            </div>
                            <p style="margin: 16px 0 0; color: #475569; font-size: 12px;">
                              © ${new Date().getFullYear()} GameKeys. All rights reserved.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                </table>

                <!-- Bottom text -->
                <p style="margin: 24px 0 0; text-align: center; color: #475569; font-size: 12px;">
                  This email was sent to ${email}
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });
}