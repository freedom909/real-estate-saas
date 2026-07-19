import OpenAI, { toFile } from "openai";
import { IVoiceRepository } from "./IVoice.repository";

export class OpenAIVoiceRepository implements IVoiceRepository {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async speechToText(audio: Buffer, language: string): Promise<string> {
    const file = await toFile(audio, "audio.webm", { type: "audio/webm" });

    const response = await this.client.audio.transcriptions.create({
      model: "whisper-1",
      file,
      language: language === "ja" ? "ja" : undefined,
      response_format: "text",
    });

    return response;
  }

  async textToSpeech(
    text: string,
    language: string,
    voice?: string
  ): Promise<Buffer> {
    const voiceName = voice || (language === "ja" ? "Shimmer" : "Alloy");

    const response = await this.client.audio.speech.create({
      model: "tts-1",
      voice: voiceName as any,
      input: text,
      response_format: "mp3",
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
  }
}
