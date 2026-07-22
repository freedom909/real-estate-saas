"use client";

import { useState } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useVoiceChat } from "../hooks/useVoiceChat";

interface VoiceButtonProps {
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  language?: string;
}

export default function VoiceButton({
  onTranscript,
  onResponse,
  language = "ja",
}: VoiceButtonProps) {
  const {
    state,
    currentTranscript,
    currentResponse,
    error,
    startRecording,
    stopRecording,
    clearError,
  } = useVoiceChat({ language });

  const handleClick = () => {
    if (state === "recording") {
      stopRecording();
    } else if (state === "idle" || state === "speaking") {
      startRecording();
    }
  };

  // 認識結果を親コンポーネントに通知
  if (currentTranscript && onTranscript) {
    onTranscript(currentTranscript);
  }

  // 応答を親コンポーネントに通知
  if (currentResponse && onResponse) {
    onResponse(currentResponse);
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={state === "connecting" || state === "processing"}
        className={`rounded-full p-3 transition-all ${
          state === "recording"
            ? "bg-red-500 text-white animate-pulse"
            : state === "processing"
            ? "bg-yellow-500 text-white"
            : "bg-blue-500 text-white hover:bg-blue-600"
        } disabled:opacity-50`}
        title={state === "recording" ? "録音停止" : "音声入力"}
      >
        {state === "connecting" || state === "processing" ? (
          <Loader2 size={20} className="animate-spin" />
        ) : state === "recording" ? (
          <MicOff size={20} />
        ) : (
          <Mic size={20} />
        )}
      </button>

      {/* エラー表示 */}
      {error && (
        <div className="absolute top-full left-1/2 mt-2 w-48 -translate-x-1/2 rounded-lg bg-red-50 p-2 text-xs text-red-600 shadow-lg">
          {error}
          <button
            onClick={clearError}
            className="ml-2 text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* 録音中のインジケータ */}
      {state === "recording" && (
        <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 animate-ping" />
      )}
    </div>
  );
}
