import { inject, injectable } from "tsyringe";
import { IVoiceRepository } from "../../infra/IVoice.repository";
import { WISDOM_VOICE_TOKENS } from "../../container/tokens/wisdom.tokens";

@injectable()
export class SpeechRecognizer {
  constructor(
    @inject(WISDOM_VOICE_TOKENS.repository)
    private readonly voiceRepo: IVoiceRepository
  ) {}

  async recognize(audio: Buffer, language: string = "ja"): Promise<string> {
    if (!audio || audio.length === 0) {
      throw new Error("Audio buffer is empty");
    }

    const text = await this.voiceRepo.speechToText(audio, language);
    return text.trim();
  }
}
