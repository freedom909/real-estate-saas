import { gql } from "@apollo/client";

export const TEXT_TO_SPEECH = gql`
  mutation TextToSpeech($input: TextToSpeechInput!) {
    textToSpeech(input: $input) {
      success
      audio
      format
    }
  }
`;

export const SPEECH_TO_TEXT = gql`
  mutation SpeechToText($input: SpeechToTextInput!) {
    speechToText(input: $input) {
      success
      audio
      format
    }
  }
`;

export const VOICE_CHAT = gql`
  mutation VoiceChat($input: VoiceChatInput!) {
    voiceChat(input: $input) {
      success
      transcript
      response
      audio
    }
  }
`;
