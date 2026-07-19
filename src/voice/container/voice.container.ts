import { container } from "tsyringe";
import { WISDOM_VOICE_TOKENS } from "./tokens/wisdom.tokens";
import { OpenAIVoiceRepository } from "../infra/openai-voice.repository";
import { SpeechRecognizer } from "../domain/services/speech.recognizer";
import { SpeechSynthesizer } from "../domain/services/speech.synthesizer";

export function registerVoice() {
  container.register(WISDOM_VOICE_TOKENS.repository, {
    useClass: OpenAIVoiceRepository,
  });
  console.log("  ✅ Voice Repository registered (OpenAI)");

  container.register(SpeechRecognizer, { useClass: SpeechRecognizer });
  console.log("  ✅ Speech Recognizer registered");

  container.register(SpeechSynthesizer, { useClass: SpeechSynthesizer });
  console.log("  ✅ Speech Synthesizer registered");
}
