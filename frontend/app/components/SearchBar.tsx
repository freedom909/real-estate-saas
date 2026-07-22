"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, MicOff, Search, Loader2, Volume2 } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { CHAT } from "../graphql/chat/mutations/chat";

type ChatResponse = {
  chat: {
    success: boolean;
    summary: string | null;
    artifacts: { type: string; content: any }[];
  };
};

type MicState = "idle" | "listening" | "processing";

type SearchBarProps = {
  onResults?: (result: ChatResponse["chat"]) => void;
};

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Animated waveform bars component
function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-center gap-[3px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-white transition-all"
          style={{
            height: active ? `${8 + Math.random() * 14}px` : "4px",
            animation: active
              ? `waveBar 0.${4 + i}s ease-in-out infinite alternate`
              : "none",
            animationDelay: active ? `${i * 0.1}s` : "0s",
          }}
        />
      ))}
    </div>
  );
}

// Mic button label
function MicLabel({ state }: { state: MicState }) {
  if (state === "idle") return null;
  return (
    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-medium">
      {state === "listening" ? (
        <span className="text-red-300">Listening...</span>
      ) : (
        <span className="text-blue-300">Processing...</span>
      )}
    </div>
  );
}

export default function SearchBar({ onResults }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [micState, setMicState] = useState<MicState>("idle");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [chat, { loading }] = useMutation<ChatResponse>(CHAT);
  const [isSupported, setIsSupported] = useState(false);

  const isListening = micState === "listening";
  const isProcessing = micState === "processing";

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setIsSupported(supported);
  }, []);

  const sendQuery = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setMicState("processing");
      try {
        const { data } = await chat({ variables: { message: text } });
        if (data?.chat && onResults) {
          onResults(data.chat);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setMicState("idle");
      }
    },
    [chat, onResults]
  );

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "ja-JP";

    recognition.onstart = () => {
      setMicState("listening");
      setInterimTranscript("");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      setInterimTranscript(interim);

      if (final) {
        setQuery(final);
        setMicState("processing");
        sendQuery(final);
      }
    };

    recognition.onerror = (event: Event & { error: string }) => {
      console.error("Speech recognition error:", event.error);
      setMicState("idle");
      setInterimTranscript("");
    };

    recognition.onend = () => {
      setMicState("idle");
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, sendQuery, micState]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setMicState("idle");
    setInterimTranscript("");
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else if (!isProcessing) {
      startListening();
    }
  };

  const handleSearch = () => {
    if (query.trim()) {
      sendQuery(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const displayText = isListening ? (interimTranscript || query) : query;

  return (
    <div className="mx-auto mt-10 flex max-w-3xl items-center gap-4 rounded-2xl bg-white p-4 text-gray-900 shadow-2xl">
      <Search className="shrink-0 text-gray-500" size={24} />

      <input
        type="text"
        placeholder={
          isListening
            ? "Listening..."
            : isProcessing
              ? "Processing..."
              : "Where would you like to stay?"
        }
        className="flex-1 border-none text-lg outline-none"
        value={displayText}
        onChange={(e) => {
          setQuery(e.target.value);
          setInterimTranscript("");
        }}
        onKeyDown={handleKeyDown}
        disabled={isProcessing || isListening}
      />

      {/* Mic Button with visual indicators */}
      <div className="relative shrink-0">
        {/* Pulse rings — listening state */}
        {isListening && (
          <>
            <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-20" />
            <div
              className="absolute inset-[-6px] animate-ping rounded-full bg-red-400 opacity-10"
              style={{ animationDelay: "0.3s" }}
            />
          </>
        )}

        {/* Processing spinner ring */}
        {isProcessing && (
          <div className="absolute inset-[-4px] animate-spin rounded-full border-2 border-blue-400 border-t-transparent opacity-70" />
        )}

        {/* Main Button */}
        <button
          onClick={toggleListening}
          disabled={!isSupported || isProcessing}
          className={`
            relative flex h-16 w-16 items-center justify-center rounded-full
            shadow-xl transition-all duration-300
            hover:scale-110 active:scale-95
            disabled:cursor-not-allowed disabled:opacity-50
            ${
              isListening
                ? "bg-red-600 hover:bg-red-700 shadow-red-500/40"
                : isProcessing
                  ? "bg-blue-500"
                  : "bg-blue-600 hover:bg-blue-700"
            }
          `}
        >
          {isProcessing ? (
            <Loader2 className="animate-spin text-white" size={28} />
          ) : isListening ? (
            <div className="flex items-center gap-1">
              <MicOff className="text-white" size={24} />
              <WaveformBars active={true} />
            </div>
          ) : (
            <Mic className="text-white" size={28} />
          )}
        </button>

        <MicLabel state={micState} />
      </div>

      {/* Waveform animation keyframes */}
      <style jsx>{`
        @keyframes waveBar {
          0% { height: 4px; }
          100% { height: 18px; }
        }
      `}</style>
    </div>
  );
}
