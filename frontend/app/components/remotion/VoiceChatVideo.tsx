import React, { useState, useRef, useCallback } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { AudioTrack } from "./AudioTrack";

interface VoiceMessage {
  id: string;
  transcript: string;
  response: string;
  audioUrl: string;
  timestamp: number;
}

interface VoiceChatVideoProps {
  messages: VoiceMessage[];
  backgroundMusic?: string;
  backgroundMusicVolume?: number;
}

export const VoiceChatVideo: React.FC<VoiceChatVideoProps> = ({
  messages,
  backgroundMusic,
  backgroundMusicVolume = 0.3,
}) => {
  const { fps } = useVideoConfig();

  // メッセージごとの音声トラックを計算
  const calculateMessageTimings = () => {
    let currentFrame = 0;
    return messages.map((message) => {
      const startFrame = currentFrame;
      // 音声の長さを概算（実際はオーディオファイルから取得すべき）
      const estimatedDuration = 5; // 5秒と仮�定
      const durationInFrames = estimatedDuration * fps;
      currentFrame += durationInFrames;

      return {
        ...message,
        startFrame,
        durationInFrames,
      };
    });
  };

  const messageTimings = calculateMessageTimings();

  return (
    <AbsoluteFill>
      {/* ビデオコンテンツ（ここに背景やテキストを追加） */}
      <AbsoluteFill
        style={{
          backgroundColor: "#1a1a2e",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="text-center text-white">
          <h1 className="mb-4 text-3xl font-bold">音声チャット</h1>
          <p className="text-gray-400">
            {messages.length}件のメッセージ
          </p>
        </div>
      </AbsoluteFill>

      {/* メッセージごとの音声トラック */}
      {messageTimings.map((message, index) => (
        <Sequence
          key={message.id}
          from={message.startFrame}
          durationInFrames={message.durationInFrames}
        >
          <AudioTrack
            src={message.audioUrl}
            fadeIn={0.2}
            fadeOut={0.2}
          />
        </Sequence>
      ))}

      {/* BGM（オプション） */}
      {backgroundMusic && (
        <AudioTrack
          src={backgroundMusic}
          volume={backgroundMusicVolume}
          loop
          fadeIn={1}
          fadeOut={2}
        />
      )}
    </AbsoluteFill>
  );
};

export default VoiceChatVideo;
