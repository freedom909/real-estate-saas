// src/wisdom/voice/infra/IVoice.repository.ts
export interface IVoiceRepository {

    speechToText(
        audio: Buffer,
        language: string
    ): Promise<string>;

    textToSpeech(
        text: string,
        language: string,
        voice?: string
    ): Promise<Buffer>;

}