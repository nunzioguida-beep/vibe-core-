import OpenAI, { toFile } from "openai";

const openai = new OpenAI({ apiKey: (process.env.OPENAI_API_KEY ?? "").replace(/\s+/g, "") });

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(audioBase64, "base64");
  const ext = mimeType.split(";")[0].split("/")[1] || "ogg";
  const file = await toFile(buffer, `audio.${ext}`, { type: mimeType.split(";")[0] });
  const transcription = await openai.audio.transcriptions.create({ file, model: "whisper-1" });
  return transcription.text;
}
