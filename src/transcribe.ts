import Groq from "groq-sdk";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function transcribeAudio(audioBase64: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(audioBase64, "base64");
  const ext = mimeType.split(";")[0].split("/")[1] || "ogg";
  const tmpFile = path.join(os.tmpdir(), `audio-${Date.now()}.${ext}`);

  fs.writeFileSync(tmpFile, buffer);
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: "whisper-large-v3-turbo",
    });
    return transcription.text;
  } finally {
    fs.unlinkSync(tmpFile);
  }
}
