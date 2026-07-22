"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Send, Loader2 } from "lucide-react";

type VoiceChatState = "idle" | "connecting" | "recording" | "processing" | "speaking";

interface VoiceChatMessage {
  type: "transcript" | "response" | "processing" | "error";
  text?: string;
  step?: string;
}

export default function VoiceChat() {
  const [state, setState] = useState<VoiceChatState>("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>("ja");

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // WebSocket接続
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setState("connecting");
    const ws = new WebSocket("ws://localhost:4300/ws/voice");

    ws.onopen = () => {
      console.log("WebSocket connected");
      ws.send(
        JSON.stringify({
          type: "config",
          language,
          voice: "Shimmer",
        })
      );
      setState("idle");
    };

    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        // 音声データ受信
        playAudioResponse(event.data);
      } else {
        // テキストメッセージ
        const msg: VoiceChatMessage = JSON.parse(event.data);
        handleWebSocketMessage(msg);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setError("WebSocket接続エラー");
      setState("idle");
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      wsRef.current = null;
    };

    wsRef.current = ws;
  }, [language]);

  // メッセージ処理
  const handleWebSocketMessage = (msg: VoiceChatMessage) => {
    switch (msg.type) {
      case "transcript":
        setTranscript(msg.text || "");
        setState("processing");
        break;
      case "response":
        setResponse(msg.text || "");
        setState("speaking");
        break;
      case "processing":
        setState("processing");
        break;
      case "error":
        setError(msg.text || "エラーが発生しました");
        setState("idle");
        break;
    }
  };

  // 音声録音開始
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await sendAudioToWebSocket(audioBlob);
      };

      mediaRecorder.start();
      setState("recording");
      setTranscript("");
      setResponse("");
      setError(null);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("マイクへのアクセスが拒否されました");
    }
  };

  // 音声録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // WebSocketで音声を送信
  const sendAudioToWebSocket = async (audioBlob: Blob) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("WebSocket未接続");
      setState("idle");
      return;
    }

    setState("processing");

    // 音声データ送信
    const arrayBuffer = await audioBlob.arrayBuffer();
    wsRef.current.send(arrayBuffer);

    // 処理開始のシグナル送信
    wsRef.current.send(JSON.stringify({ type: "audio" }));
  };

  // 音声レスポンスの再生
  const playAudioResponse = async (audioBlob: Blob) => {
    try {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setState("idle");
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (err) {
      console.error("Audio playback error:", err);
      setState("idle");
    }
  };

  // テキスト入力でのチャット
  const sendTextMessage = (text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connectWebSocket();
      return;
    }

    setTranscript(text);
    setState("processing");

    wsRef.current.send(
      JSON.stringify({
        type: "text",
        data: text,
      })
    );
  };

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // マイクボタンのクリック
  const handleMicClick = () => {
    if (state === "recording") {
      stopRecording();
    } else if (state === "idle" || state === "speaking") {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
      startRecording();
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="rounded-2xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold text-gray-800">音声チャット</h2>

        {/* 言語選択 */}
        <div className="mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
            <option value="zh">中文</option>
          </select>
        </div>

        {/* マイクボタン */}
        <div className="mb-6 flex justify-center">
          <button
            onClick={handleMicClick}
            disabled={state === "connecting" || state === "processing"}
            className={`rounded-full p-6 transition-all ${
              state === "recording"
                ? "bg-red-500 text-white animate-pulse"
                : state === "processing"
                ? "bg-yellow-500 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            } disabled:opacity-50`}
          >
            {state === "connecting" || state === "processing" ? (
              <Loader2 size={32} className="animate-spin" />
            ) : state === "recording" ? (
              <MicOff size={32} />
            ) : (
              <Mic size={32} />
            )}
          </button>
        </div>

        {/* ステータス表示 */}
        <div className="mb-4 text-center text-sm text-gray-500">
          {state === "idle" && "マイクをクリックして開始"}
          {state === "connecting" && "接続中..."}
          {state === "recording" && "録音中... もう一度クリックで停止"}
          {state === "processing" && "処理中..."}
          {state === "speaking" && "応答を再生中..."}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 音声認識結果 */}
        {transcript && (
          <div className="mb-4 rounded-lg bg-gray-50 p-4">
            <p className="text-xs text-gray-500">あなたの入力:</p>
            <p className="text-gray-800">{transcript}</p>
          </div>
        )}

        {/* AI応答 */}
        {response && (
          <div className="rounded-lg bg-blue-50 p-4">
            <p className="text-xs text-gray-500">応答:</p>
            <p className="text-gray-800">{response}</p>
          </div>
        )}

        {/* テキスト入力 */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="テキストで入力..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                sendTextMessage(e.currentTarget.value.trim());
                e.currentTarget.value = "";
              }
            }}
          />
          <button
            onClick={(e) => {
              const input = (e.currentTarget as HTMLElement)
                .previousElementSibling as HTMLInputElement;
              if (input.value.trim()) {
                sendTextMessage(input.value.trim());
                input.value = "";
              }
            }}
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
