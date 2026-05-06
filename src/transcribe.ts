import OpenAI, { toFile } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(audioBase64, "base64");
  const ext = mimeType.split(";")[0].split("/")[1] || "ogg";

  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: await toFile(buffer, `audio.${ext}`, { type: mimeType }),
  });

  return transcription.text;
}
