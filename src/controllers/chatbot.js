const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_INPUT_LENGTH = 500;

const SYSTEM_PROMPT = `You are the official AI assistant for ButtNetworks, a professional software house that builds web applications, mobile apps, and custom digital solutions for clients. You help visitors with information about ButtNetworks services, technologies used, project timelines, pricing inquiries, and how to get in touch with the team. Be concise, friendly, and professional. If you don't know something specific about the company, tell the user to contact ButtNetworks directly instead of making up information.`;

const Chatbot = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    if (message.length > MAX_INPUT_LENGTH) {
      return res.status(400).json({
        success: false,
        error: `Message exceeds maximum allowed length of ${MAX_INPUT_LENGTH} characters`,
      });
    }

    const sanitizedMessage = message.trim();

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (Array.isArray(history)) {
      const trimmedHistory = history.slice(-10);
      for (const item of trimmedHistory) {
        if (
          item &&
          typeof item.role === "string" &&
          typeof item.content === "string" &&
          ["user", "assistant"].includes(item.role) &&
          item.content.length <= MAX_INPUT_LENGTH
        ) {
          messages.push({ role: item.role, content: item.content });
        }
      }
    }

    messages.push({ role: "user", content: sanitizedMessage });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.6,
      max_tokens: 512,
      top_p: 1,
      stream: false,
    });

    const reply = completion?.choices?.[0]?.message?.content || "";

    return res.status(200).json({
      success: true,
      reply,
      maxLength: MAX_INPUT_LENGTH,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Something went wrong while processing the chatbot request",
    });
  }
};

module.exports = Chatbot;