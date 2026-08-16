require("dotenv").config();
const Groq = require("groq-sdk");
const supabase = require("../config/supabaseClient");
const { resolveUserId } = require("../utils/tokenManager");
const { generateEmbedding } = require("../utils/embeddings");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MAX_INPUT_LENGTH = 500;

const SYSTEM_PROMPT = `You are the official AI assistant for ButtNetworks, a software house founded and run by Shahnawaz Saddam Butt. Answer using only the context provided below. If the context does not contain the answer, tell the user to contact ButtNetworks directly via WhatsApp or email instead of making up information. Be concise, friendly, and professional.`;

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

    const userId = resolveUserId(req, res);
    const sanitizedMessage = message.trim();

    const queryEmbedding = await generateEmbedding(sanitizedMessage);

    const { data: matches, error: matchError } = await supabase.rpc("match_documents", {
      query_embedding: queryEmbedding,
      match_threshold: 0.3,
      match_count: 4,
    });

    if (matchError) {
      console.error(matchError);
    }

    const context = (matches || []).map((m) => m.content).join("\n\n");

    const messages = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\nContext:\n${context}` },
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
      model: "openai/gpt-oss-120b",
      messages,
      temperature: 0.6,
      max_tokens: 512,
      top_p: 1,
      stream: false,
    });

    const reply = completion?.choices?.[0]?.message?.content || "";

    await supabase.from("chat_messages").insert([
      { user_id: userId, role: "user", content: sanitizedMessage },
      { user_id: userId, role: "assistant", content: reply },
    ]);

    return res.status(200).json({
      success: true,
      reply,
      maxLength: MAX_INPUT_LENGTH,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: err?.message || "Unknown error",
    });
  }
};

module.exports = { Chatbot };
