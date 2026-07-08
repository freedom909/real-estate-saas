// src/wisdom/voice/infra/openai-voice.repository.ts
import { IVoiceRepository } from "./IVoice.repository";


export class OpenAIVoiceRepository implements IVoiceRepository
{
    speechToText(audio: Buffer, language: string): Promise<string> {
        return Promise.resolve("");
    }

    async textToSpeech(
        text: string,
        language: string
    ): Promise<Buffer>{

        return Buffer.from("");

    }

}