"use client";

import { useState, useRef, useCallback } from "react";

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("ja");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  const startVisualization = useCallback(() => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "rgb(15, 23, 42)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(
          0,
          canvas.height,
          0,
          canvas.height - barHeight
        );
        gradient.addColorStop(0, "#f97316");
        gradient.addColorStop(1, "#ef4444");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  }, []);

  const stopVisualization = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await processAudio(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      startVisualization();
    } catch (err) {
      setError("マイクへのアクセスが拒否されました");
      console.error("Recording error:", err);
    }
  }, [startVisualization]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopVisualization();
    }
  }, [isRecording, stopVisualization]);

  const processAudio = useCallback(
    async (audioBlob) => {
      setIsProcessing(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("audio", audioBlob);

        const sttResponse = await fetch("/api/voice/stt", {
          method: "POST",
          headers: {
            "X-Language": language,
          },
          body: audioBlob,
        });

        if (!sttResponse.ok) {
          throw new Error("音声認識に失敗しました");
        }

        const sttResult = await sttResponse.json();
        setTranscript(sttResult.text);

        const ttsResponse = await fetch("/api/voice/chat", {
          method: "POST",
          headers: {
            "X-Language": language,
          },
          body: audioBlob,
        });

        if (!ttsResponse.ok) {
          throw new Error("AI応答の生成に失敗しました");
        }

        const responseText = ttsResponse.headers.get("X-Response");
        if (responseText) {
          setResponse(decodeURIComponent(responseText));
        }

        const audioResponse = await ttsResponse.blob();
        const audioUrl = URL.createObjectURL(audioResponse);
        const audio = new Audio(audioUrl);
        audio.play();
      } catch (err) {
        setError(err.message);
        console.error("Processing error:", err);
      } finally {
        setIsProcessing(false);
      }
    },
    [language]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              民宿AI アシスタント
            </span>
          </h1>
          <p className="text-slate-400">日本語でご質問ください</p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50">
          <div className="flex items-center justify-center mb-6">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-700 text-white px-4 py-2 rounded-lg mr-4 border border-slate-600"
            >
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>

          <div className="flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              width={400}
              height={100}
              className="rounded-lg bg-slate-900"
            />
          </div>

          <div className="flex justify-center mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`
                relative w-24 h-24 rounded-full flex items-center justify-center
                transition-all duration-300 transform
                ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 scale-110 shadow-lg shadow-red-500/50"
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 hover:scale-105"
                }
                ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {isProcessing ? (
                <svg
                  className="animate-spin h-10 w-10 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : isRecording ? (
                <svg
                  className="h-10 w-10 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                  />
                </svg>
              )}
            </button>
          </div>

          <div className="text-center text-sm text-slate-400 mb-6">
            {isRecording
              ? "録音中... クリックで停止"
              : isProcessing
              ? "処理中..."
              : "クリックして話しかけてください"}
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {transcript && (
            <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-400 mb-1">あなたの発言:</p>
              <p className="text-white">{transcript}</p>
            </div>
          )}

          {response && (
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-sm text-orange-400 mb-1">AI応答:</p>
              <p className="text-white">{response}</p>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
            <h3 className="text-orange-400 font-semibold mb-2">
              民宿について
            </h3>
            <p className="text-sm text-slate-400">
              部屋の空き状況、料金、アメニティについてお聞きください
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
            <h3 className="text-orange-400 font-semibold mb-2">予約管理</h3>
            <p className="text-sm text-slate-400">
              予約の確認、変更、キャンセルについてお問い合わせください
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
            <h3 className="text-orange-400 font-semibold mb-2">
              地域の観光
            </h3>
            <p className="text-sm text-slate-400">
              周辺のスポットやおすすめスポットをご案内します
            </p>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
            <h3 className="text-orange-400 font-semibold mb-2">サポート</h3>
            <p className="text-sm text-slate-400">
              ご滞在中のトラブルやご要望に対応いたします
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
