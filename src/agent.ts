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
- CRITICAL: Always reply in the exact same language the user used in their message. If they write in English, reply only in English. If Italian, only Italian. Never switch language.
- If you cannot resolve an issue, direct the user to support.wellhub.com
- Never make up information about specific gyms, prices, or policies you don't know`;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY?.trim() });

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateReply(
  userMessage: string,
  history: HistoryMessage[] = [],
  userName?: string,
  searchContext?: string
): Promise<string> {
  const parts = [SYSTEM_PROMPT];
  if (userName) parts.push(`The user's verified name is: ${userName}.`);
  if (searchContext) parts.push(`Relevant information from Wellhub sources:\n${searchContext}`);
  const systemContent = parts.join("\n\n");

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemContent },
      ...history,
      { role: "user", content: userMessage },
    ],
  });

  return completion.choices[0].message.content ?? "";
}
