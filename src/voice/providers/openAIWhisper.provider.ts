// src/wisdom/voice/providers/openAIWhisper.provider.ts
import { inject, injectable } from "tsyringe";
import { IVoiceRecognizer } from "../contracts/IVoice.recognizer";
import { WISDOM_VOICE_TOKENS } from "../container/tokens/wisdom.tokens";

@injectable()
export class OpenAIWhisperProvider implements IVoiceRecognizer {
  constructor(
    @inject(WISDOM_VOICE_TOKENS.recognizer)
    private readonly recognizer: IVoiceRecognizer,
  ) {}

  async recognize(audio: Buffer): Promise<string> {
    return this.recognizer.recognize(audio);
  }
}