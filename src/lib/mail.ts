import nodemailer from "nodemailer";

interface SendPasswordResetParams {
    toEmail: string;
    userName: string;
    resetLink: string;
}

export async function sendPasswordResetEmail({ toEmail, userName, resetLink }: SendPasswordResetParams) {
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"NGIT Education" <noreply@ngitedu.com>';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your NGIT Password</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }
            .header p { margin: 6px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; opacity: 0.9; }
            .content { padding: 36px 32px; color: #334155; line-height: 1.6; }
            .greeting { font-size: 18px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
            .button-wrapper { text-align: center; margin: 32px 0; }
            .reset-btn { display: inline-block; background-color: #4f46e5; color: #ffffff !important; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 14px; box-shadow: 0 6px 20px rgba(79, 70, 229, 0.3); transition: all 0.2s ease; }
            .warning { background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 12px; color: #92400e; font-weight: 600; }
            .link-box { background-color: #f1f5f9; border-radius: 10px; padding: 12px; font-size: 11px; word-break: break-all; color: #475569; margin-top: 16px; }
            .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 24px 32px; text-align: center; font-size: 12px; color: #64748b; }
            .footer a { color: #4f46e5; text-decoration: none; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>NGIT INSTITUTES</h1>
                <p>Official Password Recovery</p>
            </div>
            <div class="content">
                <div class="greeting">Hello ${userName || "NGIT Student"},</div>
                <p>We received a request to reset your password for your NGIT Academic Account (${toEmail}).</p>
                <p>Click the button below to set a new password for your account:</p>
                
                <div class="button-wrapper">
                    <a href="${resetLink}" target="_blank" class="reset-btn">Reset My Password</a>
                </div>

                <div class="warning">
                    ⚠️ <strong>Security Notice:</strong> This password reset link is valid for <strong>1 hour</strong>. If you did not request a password reset, please ignore this email or contact support immediately.
                </div>

                <p style="font-size: 12px; color: #64748b; margin-top: 20px;">If the button above does not work, copy and paste this link into your web browser:</p>
                <div class="link-box">${resetLink}</div>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} NGIT Institutes. All Rights Reserved.</p>
                <p>Need help? Call Admin Support: <a href="tel:+918004958441">+91 80049 58441</a></p>
            </div>
        </div>
    </body>
    </html>
    `;

    console.log("=================================================");
    console.log("🔐 PASSWORD RESET LINK GENERATED FOR:", toEmail);
    console.log("🔗 RESET LINK:", resetLink);
    console.log("=================================================");

    if (!smtpUser || !smtpPass) {
        console.warn("⚠️ SMTP credentials not configured in environment variables (SMTP_USER/SMTP_PASS). Mail logged to server console above.");
        return { success: true, simulated: true, resetLink };
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const info = await transporter.sendMail({
            from: smtpFrom,
            to: toEmail,
            subject: "Password Reset Request — NGIT Institutes",
            html: htmlContent,
        });

        console.log("✅ Password reset email sent via SMTP successfully! MessageId:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error: any) {
        console.error("❌ Failed to send password reset email via SMTP:", error);
        return { success: false, error: error.message || "Failed to deliver email" };
    }
}
