import OpenAI from "openai";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const openai = new OpenAI({ apiKey: (process.env.OPENAI_API_KEY ?? "").replace(/\s+/g, "") });

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(audioBase64, "base64");
  const ext = mimeType.split(";")[0].split("/")[1] || "ogg";
  const tmpFile = path.join(os.tmpdir(), `audio-${Date.now()}.${ext}`);

  fs.writeFileSync(tmpFile, buffer);
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: "whisper-1",
    });
    return transcription.text;
  } finally {
    fs.unlinkSync(tmpFile);
  }
}
