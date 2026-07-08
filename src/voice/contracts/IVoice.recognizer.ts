// src/wisdom/voice/contracts/IVoice.recognizer.ts
export interface IVoiceRecognizer {
  recognize(audio: Buffer): Promise<string>;
}