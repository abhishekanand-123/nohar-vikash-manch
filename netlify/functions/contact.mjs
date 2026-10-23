import { sendContactEmail } from "../../server/mailService.js";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const { name, email, phone, category, message } = data;

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "कृपया नाम, ईमेल और समस्या/संदेश भरें।" }),
      };
    }

    const info = await sendContactEmail({ name, email, phone, category, message });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        message: "आपका संदेश सफलतापूर्वक भेज दिया गया है!",
        messageId: info.messageId,
      }),
    };
  } catch (error) {
    console.error("Netlify Function Contact Email Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "ईमेल भेजने में त्रुटि हुई। कृपया कुछ समय बाद प्रयास करें।" }),
    };
  }
};
