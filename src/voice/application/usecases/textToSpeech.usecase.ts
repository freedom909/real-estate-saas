import { inject, injectable } from "tsyringe";
import { IVoiceRepository } from "../../infra/IVoice.repository";
import { WISDOM_VOICE_TOKENS } from "../../container/tokens/wisdom.tokens";

@injectable()
export class TextToSpeechUseCase {
  constructor(
    @inject(WISDOM_VOICE_TOKENS.repository)
    private readonly repository: IVoiceRepository
  ) {}

  async execute(text: string, language: string = "ja", voice?: string): Promise<Buffer> {
    if (!text || text.trim().length === 0) {
      throw new Error("Text is empty");
    }

    return this.repository.textToSpeech(text, language, voice);
  }
}
