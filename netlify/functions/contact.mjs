import { sendContactEmail } from "../../server/mailService.js";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const data = JSON.parse(event.body || "{}");
    const { name, email, phone, category, message } = data;

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "कृपया नाम, ईमेल और समस्या/संदेश भरें।" }),
      };
    }

    const info = await sendContactEmail({ name, email, phone, category, message });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
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
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: error?.message || "ईमेल भेजने में त्रुटि हुई। कृपया कुछ समय बाद प्रयास करें।",
      }),
    };
  }
};
