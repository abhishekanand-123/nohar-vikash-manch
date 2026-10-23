import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load env if running in standalone Node script
function getEnvConfig() {
  const env = { ...process.env };
  const envPath = path.join(rootDir, ".env");
  if (fs.existsSync(envPath)) {
    try {
      const lines = fs.readFileSync(envPath, "utf-8").split("\n");
      for (const line of lines) {
        const match = line.match(/^\s*([\w_]+)\s*=\s*["']?(.*?)["']?\s*$/);
        if (match && !env[match[1]]) {
          env[match[1]] = match[2];
        }
      }
    } catch (e) {
      console.warn("Could not read .env file:", e);
    }
  }
  return env;
}

export async function sendContactEmail({ name, email, phone, category = "सामान्य पूछताछ (General Inquiry)", message }) {
  const env = getEnvConfig();

  const host = env.MAIL_HOST || "smtp.gmail.com";
  const port = parseInt(env.MAIL_PORT || "587", 10);
  const username = env.MAIL_USERNAME || "abhishekanand.avology@gmail.com";
  const rawPassword = env.MAIL_PASSWORD || "tggz rjbp fifq cnki";
  const password = rawPassword.replace(/\s+/g, "");
  const fromAddress = env.MAIL_FROM_ADDRESS || "testingapp694@gmail.com";
  const fromName = env.MAIL_FROM_NAME || "Nohar Vikash Manch";
  const recipientEmail = env.MAIL_TO_ADDRESS || "abhi96anand@gmail.com";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // false for 587 STARTTLS
    auth: {
      user: username,
      pass: password,
    },
  });

  const now = new Date();
  const istDateString = now.toLocaleString("hi-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  });

  const cleanPhone = (phone || "").replace(/\D/g, "");
  const waPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;

  const mailOptions = {
    from: `"${fromName}" <${fromAddress}>`,
    to: recipientEmail,
    replyTo: email || fromAddress,
    subject: `[नोहर विकास मंच] नई समस्या / संपर्क: ${name} (${category})`,
    text: `
Nohar Vikash Manch - नया संपर्क संदेश (New Contact / Problem Submission)
============================================================

प्रेषक का नाम (Name): ${name}
ईमेल पता (Email): ${email}
फ़ोन नंबर (Phone): ${phone}
विषय / श्रेणी (Category): ${category}
प्राप्ति समय (Time): ${istDateString}

समस्या / संदेश (Problem / Message):
------------------------------------------------------------
${message}

------------------------------------------------------------
यह संदेश noharvikashmanch.in के 'हमसे संपर्क करें' पोर्टल से भेजा गया है।
    `.trim(),
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>नया संपर्क संदेश - नोहर विकास मंच</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
        <div style="max-width: 640px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, #169a4a 0%, #0f6c34 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">
              पोर्टल संपर्क सूचना • Portal Inquiry
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;">
              Nohar<span style="color: #fbbf24;">Vikash</span>Manch
            </h1>
            <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">
              ग्राम नौहर (ग्वालपाड़ा, मधेपुरा) • डिजिटल पोर्टल
            </p>
          </div>

          <!-- Notification Title -->
          <div style="padding: 24px 28px 12px 28px; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <h2 style="margin: 0; font-size: 18px; color: #0f172a; font-weight: 700;">
                📩 नया संदेश / समस्या प्राप्त हुई
              </h2>
              <span style="background: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; border: 1px solid #a7f3d0;">
                ${category}
              </span>
            </div>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #64748b;">
              प्राप्ति तिथि व समय: <strong>${istDateString}</strong>
            </p>
          </div>

          <!-- Sender Details Table -->
          <div style="padding: 24px 28px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <tr>
                  <td style="padding: 8px 0; color: #64748b; width: 140px; font-weight: 500;">
                    👤 प्रेषक का नाम (Name):
                  </td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 700; font-size: 15px;">
                    ${name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500;">
                    ✉️ ईमेल (Email):
                  </td>
                  <td style="padding: 8px 0;">
                    <a href="mailto:${email}" style="color: #169a4a; font-weight: 600; text-decoration: none;">
                      ${email}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500;">
                    📞 फ़ोन (Phone):
                  </td>
                  <td style="padding: 8px 0;">
                    <a href="tel:${phone}" style="color: #0284c7; font-weight: 700; text-decoration: none; font-size: 15px;">
                      ${phone}
                    </a>
                    ${cleanPhone ? `
                    <a href="https://wa.me/${waPhone}" style="display: inline-block; margin-left: 10px; background: #25d366; color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; text-decoration: none;">
                      WhatsApp
                    </a>` : ""}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #64748b; font-weight: 500;">
                    🏷️ श्रेणी (Category):
                  </td>
                  <td style="padding: 8px 0; color: #0f172a; font-weight: 600;">
                    ${category}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Message Box -->
            <div style="margin-bottom: 28px;">
              <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; margin-bottom: 8px;">
                📝 क्या समस्या है / विस्तृत विवरण (Message Details):
              </div>
              <div style="background: #ffffff; border: 2px solid #e2e8f0; border-left: 5px solid #169a4a; border-radius: 8px; padding: 18px 20px; font-size: 15px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">
${message}
              </div>
            </div>

            <!-- Quick Action Buttons -->
            <div style="text-align: center; padding: 10px 0 20px 0; border-top: 1px dashed #cbd5e1;">
              <a href="mailto:${email}?subject=${encodeURIComponent("Re: " + category + " - नोहर विकास मंच")}" style="display: inline-block; background: #169a4a; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; margin: 4px 6px;">
                ईमेल द्वारा उत्तर दें (Reply via Email)
              </a>
              <a href="tel:${phone}" style="display: inline-block; background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; padding: 12px 22px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; margin: 4px 6px;">
                कॉल करें (Call Now)
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 6px 0;">
              यह ईमेल <strong>नोहर विकास युवक संघ</strong> के आधिकारिक वेब पोर्टल (<a href="https://noharvikashmanch.in" style="color: #169a4a; text-decoration: none;">noharvikashmanch.in</a>) द्वारा स्वचालित रूप से भेजा गया है।
            </p>
            <p style="margin: 0; color: #94a3b8;">
              ग्राम नौहर, पोस्ट – ग्वालपाड़ा, जिला – मधेपुरा, बिहार (852115) • संपर्क: +91 8770824752
            </p>
          </div>

        </div>
      </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
}
