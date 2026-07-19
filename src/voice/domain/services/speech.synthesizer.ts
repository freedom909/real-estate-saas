import { inject, injectable } from "tsyringe";
import { IVoiceRepository } from "../../infra/IVoice.repository";
import { WISDOM_VOICE_TOKENS } from "../../container/tokens/wisdom.tokens";

@injectable()
export class SpeechSynthesizer {
  constructor(
    @inject(WISDOM_VOICE_TOKENS.repository)
    private readonly voiceRepo: IVoiceRepository
  ) {}

  async synthesize(
    text: string,
    language: string = "ja",
    voice?: string
  ): Promise<Buffer> {
    if (!text || text.trim().length === 0) {
      throw new Error("Text is empty");
    }

    const audio = await this.voiceRepo.textToSpeech(text, language, voice);
    return audio;
  }
}
