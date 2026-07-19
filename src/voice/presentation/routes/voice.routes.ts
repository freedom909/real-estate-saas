import { Router, Request, Response } from "express";
import { container } from "tsyringe";
import { SpeechRecognizer } from "../../domain/services/speech.recognizer";
import { SpeechSynthesizer } from "../../domain/services/speech.synthesizer";
import { ChatUseCase } from "../../../wisdom/application/usecases/chat.use-case";
import { AIRequestFactory } from "../../../wisdom/resolvers/aiRequest.factory";
import { WISDOM_TOKENS } from "../../../wisdom/container/tokens/wisdom.tokens";

const router = Router();

router.post("/voice/stt", async (req: Request, res: Response) => {
  try {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        const audioBuffer = Buffer.concat(chunks);
        const language = (req.headers["x-language"] as string) || "ja";

        const recognizer = container.resolve(SpeechRecognizer);
        const text = await recognizer.recognize(audioBuffer, language);

        res.json({ success: true, text });
      } catch (error) {
        console.error("❌ STT ERROR:", error);
        res.status(500).json({
          success: false,
          error: "Failed to recognize speech",
        });
      }
    });
  } catch (error) {
    console.error("❌ STT ROUTE ERROR:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/voice/tts", async (req: Request, res: Response) => {
  try {
    const { text, language, voice } = req.body;

    if (!text) {
      res.status(400).json({ success: false, error: "Text is required" });
      return;
    }

    const synthesizer = container.resolve(SpeechSynthesizer);
    const audioBuffer = await synthesizer.synthesize(
      text,
      language || "ja",
      voice
    );

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length.toString(),
    });
    res.send(audioBuffer);
  } catch (error) {
    console.error("❌ TTS ERROR:", error);
    res.status(500).json({ success: false, error: "Failed to synthesize speech" });
  }
});

router.post("/voice/chat", async (req: Request, res: Response) => {
  try {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", async () => {
      try {
        const audioBuffer = Buffer.concat(chunks);
        const language = (req.headers["x-language"] as string) || "ja";

        const recognizer = container.resolve(SpeechRecognizer);
        const synthesizer = container.resolve(SpeechSynthesizer);

        const transcript = await recognizer.recognize(audioBuffer, language);

        const factory = container.resolve(AIRequestFactory);
        const aiRequest = factory.create("voice", {
          transcript,
          identity: {
            user: (req as any).user,
          },
          runtime: {
            locale: language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          resources: {},
        });

        const chatUseCase = container.resolve<ChatUseCase>(
          WISDOM_TOKENS.chatUseCase
        );
        const result = await chatUseCase.execute(aiRequest);

        const responseAudio = await synthesizer.synthesize(
          result.summary,
          language
        );

        res.set({
          "Content-Type": "audio/mpeg",
          "Content-Length": responseAudio.length.toString(),
          "X-Transcript": encodeURIComponent(transcript),
          "X-Response": encodeURIComponent(result.summary),
        });
        res.send(responseAudio);
      } catch (error) {
        console.error("❌ VOICE CHAT ERROR:", error);
        res.status(500).json({
          success: false,
          error: "Failed to process voice chat",
        });
      }
    });
  } catch (error) {
    console.error("❌ VOICE CHAT ROUTE ERROR:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

export default router;
