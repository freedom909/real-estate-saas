import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { container } from "tsyringe";
import { SpeechRecognizer } from "../../domain/services/speech.recognizer";
import { SpeechSynthesizer } from "../../domain/services/speech.synthesizer";
import { ChatUseCase } from "../../../wisdom/application/usecases/chat.use-case";
import { AIRequestFactory } from "../../../wisdom/resolvers/aiRequest.factory";
import { WISDOM_TOKENS } from "../../../wisdom/container/tokens/wisdom.tokens";

interface VoiceMessage {
  type: "audio" | "text" | "config";
  data?: ArrayBuffer | string;
  language?: string;
  voice?: string;
}

export function setupVoiceWebSocket(server: Server): void {
  const wss = new WebSocketServer({ server, path: "/ws/voice" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("🎙️ Voice WebSocket connected");

    let language = "ja";
    let voice = "Shimmer";
    const audioChunks: Buffer[] = [];

    ws.on("message", async (message: Buffer, isBinary: boolean) => {
      try {
        if (isBinary) {
          // 音声データ受信
          audioChunks.push(message);

          // 音声の最後を検出（300ms以上無音なら処理開始）
          // 実際にはクライアント側で音声の開始/終了を制御する
        } else {
          // テキストメッセージ
          const msg: VoiceMessage = JSON.parse(message.toString());

          switch (msg.type) {
            case "config":
              // 設定更新
              language = msg.language || "ja";
              voice = msg.voice || "Shimmer";
              ws.send(JSON.stringify({ type: "config_ack", language, voice }));
              break;

            case "audio":
              // 音声データの処理開始
              if (audioChunks.length > 0) {
                await processVoiceChat(
                  ws,
                  Buffer.concat(audioChunks),
                  language,
                  voice
                );
                audioChunks.length = 0;
              }
              break;

            case "text":
              // テキスト入力（音声なし）
              await processTextChat(ws, msg.data as string, language, voice);
              break;
          }
        }
      } catch (error) {
        console.error("WebSocket error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process voice data",
          })
        );
      }
    });

    ws.on("close", () => {
      console.log("🎙️ Voice WebSocket disconnected");
    });
  });
}

async function processVoiceChat(
  ws: WebSocket,
  audioBuffer: Buffer,
  language: string,
  voice: string
): Promise<void> {
  const recognizer = container.resolve(SpeechRecognizer);
  const synthesizer = container.resolve(SpeechSynthesizer);

  // 音声認識
  ws.send(JSON.stringify({ type: "processing", step: "recognizing" }));
  const transcript = await recognizer.recognize(audioBuffer, language);

  // テキストをクライアントに送信
  ws.send(JSON.stringify({ type: "transcript", text: transcript }));

  // AI応答生成
  ws.send(JSON.stringify({ type: "processing", step: "thinking" }));
  const factory = container.resolve(AIRequestFactory);
  const aiRequest = factory.create("voice", {
    transcript,
    identity: {},
    runtime: {
      locale: language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    resources: {},
  });

  const chatUseCase = container.resolve<ChatUseCase>(WISDOM_TOKENS.chatUseCase);
  const result = await chatUseCase.execute(aiRequest);

  // 応答テキストを送信
  ws.send(JSON.stringify({ type: "response", text: result.summary }));

  // 音声合成
  ws.send(JSON.stringify({ type: "processing", step: "synthesizing" }));
  const responseAudio = await synthesizer.synthesize(result.summary, language, voice);

  // 音声データを送信
  ws.send(responseAudio);
}

async function processTextChat(
  ws: WebSocket,
  text: string,
  language: string,
  voice: string
): Promise<void> {
  const synthesizer = container.resolve(SpeechSynthesizer);

  // AI応答生成
  ws.send(JSON.stringify({ type: "processing", step: "thinking" }));
  const factory = container.resolve(AIRequestFactory);
  const aiRequest = factory.create("voice", {
    transcript: text,
    identity: {},
    runtime: {
      locale: language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    resources: {},
  });

  const chatUseCase = container.resolve<ChatUseCase>(WISDOM_TOKENS.chatUseCase);
  const result = await chatUseCase.execute(aiRequest);

  // 応答テキストを送信
  ws.send(JSON.stringify({ type: "response", text: result.summary }));

  // 音声合成
  ws.send(JSON.stringify({ type: "processing", step: "synthesizing" }));
  const responseAudio = await synthesizer.synthesize(result.summary, language, voice);

  // 音声データを送信
  ws.send(responseAudio);
}
