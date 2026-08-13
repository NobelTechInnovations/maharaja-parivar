import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
const isConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

let transporter = null;
function getTransporter() {
  if (!isConfigured) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * Sends an email if SMTP_HOST/SMTP_USER/SMTP_PASS are configured;
 * otherwise logs it to the console so the flow (welcome email, password
 * reset link, approval notice) is still testable in dev without real
 * SMTP credentials. See .env.local.example for what to set — any SMTP
 * provider works (Gmail app password, Resend, Mailgun, SES SMTP, …).
 */
export async function sendEmail({ to, subject, html, text }) {
  const from = EMAIL_FROM || "Maharaja Parivaar <no-reply@maharajaparivar.in>";

  const client = getTransporter();
  if (!client) {
    console.log(
      `[email:not-configured] Would send to ${to} — "${subject}"\n${text || html}`
    );
    return { sent: false, reason: "not-configured" };
  }

  try {
    await client.sendMail({ from, to, subject, html, text });
    return { sent: true };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return { sent: false, reason: "error" };
  }
}

const BRAND_HEADER = `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:480px;margin:0 auto;">
    <div style="font-family:Georgia,serif;font-size:20px;color:#211c14;margin-bottom:20px;">Maharaja Parivaar</div>
`;
const BRAND_FOOTER = `
    <p style="margin-top:28px;font-size:12px;color:#6c6252;">
      Maharaja Parivaar — an independent alumni community for University Maharaja's College, Jaipur.
    </p>
  </div>
`;

export function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: "Welcome to Maharaja Parivaar",
    text: `Hi ${user.name}, thanks for joining Maharaja Parivaar. Your registration is being reviewed by the founder — you'll get an email once your profile is verified.`,
    html: `${BRAND_HEADER}
      <p>Hi ${user.name},</p>
      <p>Thanks for joining <strong>Maharaja Parivaar</strong>. Your registration is now waiting on the founder's review — you'll get an email as soon as your profile is verified and visible to other Maharajians.</p>
      ${BRAND_FOOTER}`,
  });
}

export function sendAccountApprovedEmail(user) {
  const url = process.env.NEXT_PUBLIC_APP_URL || "https://maharajaparivar.in";
  return sendEmail({
    to: user.email,
    subject: "You're verified — welcome to Maharaja Parivaar",
    text: `Hi ${user.name}, your account has been approved. Log in to complete your profile and start finding fellow Maharajians: ${url}/login`,
    html: `${BRAND_HEADER}
      <p>Hi ${user.name},</p>
      <p>Your account has been approved — you're now a verified Maharajian. You can search the directory, connect, and message fellow alumni.</p>
      <p><a href="${url}/login" style="display:inline-block;padding:10px 18px;background:#862e2a;color:#fff;text-decoration:none;border-radius:6px;">Log in</a></p>
      ${BRAND_FOOTER}`,
  });
}

export function sendPasswordResetEmail(user, token) {
  const url = process.env.NEXT_PUBLIC_APP_URL || "https://maharajaparivar.in";
  const link = `${url}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: "Reset your Maharaja Parivaar password",
    text: `Reset your password: ${link} (expires in 1 hour). If you didn't request this, ignore this email.`,
    html: `${BRAND_HEADER}
      <p>Hi ${user.name},</p>
      <p>We got a request to reset your Maharaja Parivaar password. This link expires in 1 hour.</p>
      <p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#862e2a;color:#fff;text-decoration:none;border-radius:6px;">Reset password</a></p>
      <p style="font-size:13px;color:#6c6252;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
      ${BRAND_FOOTER}`,
  });
}
