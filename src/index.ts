import "dotenv/config";
import express, { Request, Response } from "express";
import { generateReply } from "./agent";
import { transcribeAudio } from "./transcribe";

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

interface MessageEnvelope {
  messageId: string;
  from: string;
  timestamp: string;
  type: "text" | "audio";
  text?: string;
  audioData?: string;
  audioMimeType?: string;
  history?: HistoryMessage[];
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
    if (!envelope.audioData) {
      res.json({ reply: "Non ho ricevuto l'audio. Riprova.", messageId: envelope.messageId } satisfies AgentResponse);
      return;
    }
    let userMessage: string;
    try {
      userMessage = await transcribeAudio(envelope.audioData, envelope.audioMimeType ?? "audio/ogg");
      console.log(`[core] transcribed: "${userMessage}"`);
    } catch (err) {
      console.error("Whisper error:", err);
      res.json({ reply: "Non sono riuscito a capire il messaggio vocale. Puoi scriverlo?", messageId: envelope.messageId } satisfies AgentResponse);
      return;
    }
    try {
      const reply = await generateReply(userMessage, envelope.history);
      res.json({ reply, messageId: envelope.messageId } satisfies AgentResponse);
    } catch (err) {
      console.error("Groq error after transcription:", err);
      res.status(500).json({ error: String(err) });
    }
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
    reply = await generateReply(userMessage, envelope.history);
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: String(err) });
    return;
  }

  res.json({ reply, messageId: envelope.messageId } satisfies AgentResponse);
});

app.get("/health", (_req, res) => res.json({ status: "ok", version: "memory-v1" }));

app.listen(PORT, () => {
  console.log(`vibe-core listening on port ${PORT}`);
});
