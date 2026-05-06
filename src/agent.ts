import Groq from "groq-sdk";

const SYSTEM_PROMPT = `You are Vibe, a friendly and helpful customer support agent for Wellhub (formerly Gympass).
You help users with:
- Gym and partner studio access
- Plans, subscriptions, and benefits
- Booking classes and sessions
- Account and billing questions
- Troubleshooting access issues

Rules:
- Be concise and warm — this is a WhatsApp chat, keep replies short
- Respond in the same language the user writes in
- If you cannot resolve an issue, direct the user to support.wellhub.com
- Never make up information about specific gyms, prices, or policies you don't know`;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateReply(userMessage: string): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
  });

  return completion.choices[0].message.content ?? "";
}
