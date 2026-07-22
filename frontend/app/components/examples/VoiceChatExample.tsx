"use client";

import { useState } from "react";
import VoiceChat from "../VoiceChat";
import VoiceButton from "../VoiceButton";
import { useVoiceChat } from "../../hooks/useVoiceChat";

export default function VoiceChatExample() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="mb-8 text-3xl font-bold text-center">
        音声チャット統合例
      </h1>

      {/* 例1: 基本的な音声チャット */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">
          1. 基本的な音声チャット
        </h2>
        <VoiceChat />
      </section>

      {/* 例2: VoiceButtonの統合 */}
      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold">
          2. VoiceButtonの統合
        </h2>
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center gap-4">
            <VoiceButton
              onTranscript={setText}
              onResponse={setResponse}
              language="ja"
            />
            <span className="text-gray-500">マイクをクリックして話してください</span>
          </div>

          {text && (
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-500">あなたの入力:</p>
              <p>{text}</p>
            </div>
          )}

          {response && (
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-gray-500">応答:</p>
              <p>{response}</p>
            </div>
          )}
        </div>
      </section>

      {/* 例3: チャット履歴の表示 */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">
          3. チャット履歴
        </h2>
        <ChatHistory />
      </section>
    </div>
  );
}

function ChatHistory() {
  const {
    messages,
    state,
    startRecording,
    stopRecording,
    sendText,
  } = useVoiceChat();

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500">
            メッセージはまだありません
          </p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="mb-4 border-b pb-4">
              <div className="mb-2 rounded-lg bg-gray-100 p-3">
                <p className="text-sm text-gray-500">あなた:</p>
                <p>{msg.transcript}</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-sm text-gray-500">AI:</p>
                <p>{msg.response}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={state === "recording" ? stopRecording : startRecording}
          className={`rounded-lg px-4 py-2 ${
            state === "recording"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          {state === "recording" ? "停止" : "録音"}
        </button>

        <input
          type="text"
          placeholder="テキストで入力..."
          className="flex-1 rounded-lg border px-4 py-2"
          onKeyPress={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              sendText(e.currentTarget.value.trim());
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
