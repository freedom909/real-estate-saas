import { useState, useRef, useCallback, useEffect } from "react";

type VoiceChatState = "idle" | "connecting" | "recording" | "processing" | "speaking";

interface VoiceMessage {
  id: string;
  transcript: string;
  response: string;
  audioBlob?: Blob;
  timestamp: number;
}

interface UseVoiceChatOptions {
  language?: string;
  voice?: string;
  wsUrl?: string;
}

export function useVoiceChat(options: UseVoiceChatOptions = {}) {
  const {
    language = "ja",
    voice = "Shimmer",
    wsUrl = "ws://localhost:4300/ws/voice",
  } = options;

  const [state, setState] = useState<VoiceChatState>("idle");
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [currentResponse, setCurrentResponse] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const messageIdRef = useRef(0);

  // WebSocket接続
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      setState("connecting");
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("Voice WebSocket connected");
        ws.send(
          JSON.stringify({
            type: "config",
            language,
            voice,
          })
        );
        setState("idle");
        resolve();
      };

      ws.onmessage = (event) => {
        if (event.data instanceof Blob) {
          // 音声データ受信
          handleAudioResponse(event.data);
        } else {
          // テキストメッセージ
          const msg = JSON.parse(event.data);
          handleWebSocketMessage(msg);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("WebSocket接続エラー");
        setState("idle");
        reject(error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        wsRef.current = null;
      };

      wsRef.current = ws;
    });
  }, [wsUrl, language, voice]);

  // メッセージ処理
  const handleWebSocketMessage = (msg: any) => {
    switch (msg.type) {
      case "transcript":
        setCurrentTranscript(msg.text || "");
        setState("processing");
        break;
      case "response":
        setCurrentResponse(msg.text || "");
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

  // 音声レスポンスの処理
  const handleAudioResponse = async (audioBlob: Blob) => {
    const messageId = `msg-${++messageIdRef.current}`;
    const newMessage: VoiceMessage = {
      id: messageId,
      transcript: currentTranscript,
      response: currentResponse,
      audioBlob,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setCurrentTranscript("");
    setCurrentResponse("");

    // 音声を再生
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

  // 録音開始
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
        await sendAudio(audioBlob);
      };

      mediaRecorder.start();
      setState("recording");
      setCurrentTranscript("");
      setCurrentResponse("");
      setError(null);
    } catch (err) {
      console.error("Microphone access error:", err);
      setError("マイクへのアクセスが拒否されました");
    }
  };

  // 録音停止
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // 音声送信
  const sendAudio = async (audioBlob: Blob) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setError("WebSocket未接続");
      setState("idle");
      return;
    }

    setState("processing");

    const arrayBuffer = await audioBlob.arrayBuffer();
    wsRef.current.send(arrayBuffer);
    wsRef.current.send(JSON.stringify({ type: "audio" }));
  };

  // テキスト送信
  const sendText = (text: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      connect().then(() => {
        sendText(text);
      });
      return;
    }

    setCurrentTranscript(text);
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

  return {
    state,
    messages,
    currentTranscript,
    currentResponse,
    error,
    connect,
    startRecording,
    stopRecording,
    sendText,
    clearError: () => setError(null),
  };
}
