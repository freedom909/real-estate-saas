import { container } from "tsyringe";
import { SpeechRecognizer } from "./domain/services/speech.recognizer";
import { SpeechSynthesizer } from "./domain/services/speech.synthesizer";
import { ChatUseCase } from "../wisdom/application/usecases/chat.use-case";
import { AIRequestFactory } from "../wisdom/resolvers/aiRequest.factory";
import { WISDOM_TOKENS } from "../wisdom/container/tokens/wisdom.tokens";

export const voiceResolvers = {
  Mutation: {
    textToSpeech: async (_, { input }) => {
      try {
        const synthesizer = container.resolve(SpeechSynthesizer);
        const audioBuffer = await synthesizer.synthesize(
          input.text,
          input.language || "ja",
          input.voice
        );

        return {
          success: true,
          audio: audioBuffer.toString("base64"),
          format: "mp3",
        };
      } catch (error) {
        console.error("❌ TEXT_TO_SPEECH ERROR:", error);
        return {
          success: false,
          audio: null,
          format: "mp3",
        };
      }
    },

    speechToText: async (_, { input }) => {
      try {
        const recognizer = container.resolve(SpeechRecognizer);
        const audioBuffer = Buffer.from(input.audio, "base64");
        const text = await recognizer.recognize(
          audioBuffer,
          input.language || "ja"
        );

        return {
          success: true,
          audio: text,
          format: "text",
        };
      } catch (error) {
        console.error("❌ SPEECH_TO_TEXT ERROR:", error);
        return {
          success: false,
          audio: null,
          format: "text",
        };
      }
    },

    voiceChat: async (_, { input }, context) => {
      try {
        const recognizer = container.resolve(SpeechRecognizer);
        const synthesizer = container.resolve(SpeechSynthesizer);

        const audioBuffer = Buffer.from(input.audio, "base64");
        const transcript = await recognizer.recognize(
          audioBuffer,
          input.language || "ja"
        );

        const factory = container.resolve(AIRequestFactory);
        const aiRequest = factory.create("voice", {
          transcript,
          identity: {
            user: context.user,
            tenant: context.tenant,
          },
          runtime: {
            locale: input.language || "ja",
            timezone: context.timezone,
            session: {
              id: context.user?.sessionId,
            },
          },
          resources: {},
        });

        const chatUseCase = container.resolve<ChatUseCase>(
          WISDOM_TOKENS.chatUseCase
        );
        const result = await chatUseCase.execute(aiRequest);

        const responseAudio = await synthesizer.synthesize(
          result.summary,
          input.language || "ja",
          input.voice
        );

        return {
          success: true,
          transcript,
          response: result.summary,
          audio: responseAudio.toString("base64"),
        };
      } catch (error) {
        console.error("❌ VOICE_CHAT ERROR:", error);
        return {
          success: false,
          transcript: null,
          response: "エラーが発生しました。もう一度お試しください。",
          audio: null,
        };
      }
    },
  },
};
