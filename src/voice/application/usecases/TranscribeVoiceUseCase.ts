// src/wisdom/voice/application/usecases/TranscribeVoiceUseCase.ts
import { inject, injectable } from "tsyringe";

import { WISDOM_VOICE_TOKENS } from "../../container/tokens/wisdom.tokens";
import { IVoiceRecognizer } from "../../contracts/IVoice.recognizer";

@injectable()
export class TranscribeVoiceUseCase {
  constructor(
    @inject(WISDOM_VOICE_TOKENS.recognizer)
    private readonly recognizer: IVoiceRecognizer,
  ) {}
  
  async execute(audio: Buffer): Promise<string> {
    return await this.recognizer.recognize(audio);
  }
}