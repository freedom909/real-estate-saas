import { inject, injectable } from "tsyringe";
import { IVoiceRepository } from "../../infra/IVoice.repository";
import { WISDOM_VOICE_TOKENS } from "../../container/tokens/wisdom.tokens";

@injectable()
export class TranscribeVoiceUseCase {
  constructor(
    @inject(WISDOM_VOICE_TOKENS.repository)
    private readonly repository: IVoiceRepository
  ) {}

  async execute(audio: Buffer, language: string = "ja"): Promise<string> {
    if (!audio || audio.length === 0) {
      throw new Error("Audio buffer is empty");
    }

    return this.repository.speechToText(audio, language);
  }
}
