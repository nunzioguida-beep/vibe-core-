import "dotenv/config";
import express, { Request, Response } from "express";
import { generateReply } from "./agent";

interface MessageEnvelope {
  messageId: string;
  from: string;
  timestamp: string;
  type: "text" | "audio";
  text?: string;
  audioUrl?: string;
}

interface AgentResponse {
  reply: string;
  messageId: string;
}

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(express.json());

app.post("/process", async (req: Request, res: Response) => {
  const envelope = req.body as MessageEnvelope;

  if (envelope.type === "audio") {
    res.json({
      reply: "Sorry, voice messages are not supported yet. Please send a text message.",
      messageId: envelope.messageId,
    } satisfies AgentResponse);
    return;
  }

  const userMessage = envelope.text ?? "";

  if (!userMessage.trim()) {
    res.json({
      reply: "I didn't receive any message. Can you try again?",
      messageId: envelope.messageId,
    } satisfies AgentResponse);
    return;
  }

  let reply: string;
  try {
    reply = await generateReply(userMessage);
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: String(err) });
    return;
  }

  res.json({ reply, messageId: envelope.messageId } satisfies AgentResponse);
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.get("/debug-key", (_req, res) => {
  const key = process.env.GROQ_API_KEY ?? "";
  res.json({ length: key.length, prefix: key.slice(0, 8), suffix: key.slice(-4) });
});

app.listen(PORT, () => {
  console.log(`vibe-core listening on port ${PORT}`);
});
