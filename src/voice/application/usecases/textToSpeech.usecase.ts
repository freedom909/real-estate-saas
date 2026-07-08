// src/wisdom/voice/application/usecases/textToSpeech.usecase.ts
import { inject, injectable } from "tsyringe";
import { IVoiceRepository } from "../../infra/IVoice.repository";
import { WISDOM_VOICE_TOKENS } from "../../container/tokens/wisdom.tokens";

@injectable()
export class TextToSpeechUseCase {
  constructor(
    @inject(WISDOM_VOICE_TOKENS.repository)
    private readonly repository: IVoiceRepository,
  ) {}

  async execute(text: string, language: "ja", voice?: string): Promise<Buffer> {
    return this.repository.textToSpeech(text, language, voice);
  }
}