"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useMutation } from "@apollo/client/react";
import { CHAT } from "../graphql/chat/mutations/chat";
import Navbar from "../components/navbar";
import Link from "next/link";
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from "lucide-react";

type ChatResponse = {
  chat: {
    success: boolean;
    summary: string | null;
    artifacts: { type: string; content: any }[];
  };
};

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  artifacts?: { type: string; content: any }[];
};

type MicState = "idle" | "listening" | "processing";

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

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 1.0;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function ListingResult({ content }: { content: any }) {
  const listings = Array.isArray(content)
    ? content
    : content?.listings
      ? content.listings
      : [content];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {listings.map((listing: any, i: number) => (
        <Link
          key={i}
          href={`/listing/${listing.id}`}
          className="min-w-[220px] max-w-[260px] shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
        >
          <img
            src={listing.picture?.[0] || "https://picsum.photos/400/250"}
            alt={listing.title || "Listing"}
            className="h-32 w-full object-cover"
          />
          <div className="p-3">
            <h4 className="text-sm font-bold text-gray-800 line-clamp-1">
              {listing.title || "Untitled"}
            </h4>
            {listing.address && (
              <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">{listing.address}</p>
            )}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">
                ¥{listing.price}
              </span>
              <span className="text-xs text-blue-500 underline">View details</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function ArtifactCard({ artifact }: { artifact: { type: string; content: any } }) {
  if (artifact.type === "LISTING_SEARCH_RESULT" || artifact.type === "LISTING_SELECTED") {
    return <ListingResult content={artifact.content} />;
  }

  if (artifact.type === "BOOKING_CREATED" || artifact.type === "BOOKING_GET") {
    const booking = artifact.content;
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <span className="mb-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
          Booking
        </span>
        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-xs text-gray-700">
          {typeof booking === "string" ? booking : JSON.stringify(booking, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <span className="mb-1 inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
        {artifact.type.replace(/_/g, " ")}
      </span>
      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-xs text-gray-700">
        {typeof artifact.content === "string"
          ? artifact.content
          : JSON.stringify(artifact.content, null, 2)}
      </pre>
    </div>
  );
}

export default function AssistantPage() {
  const Chatbot = () => {
    const [messages, setMessages] = useState<Message[]>([
      {
        id: 1,
        text: "こんにちは！ミニ宿のアシスタントです。どのようにお手伝いしましょうか？",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    const [inputText, setInputText] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [micState, setMicState] = useState<MicState>("idle");
    const [speakingId, setSpeakingId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [chat, { loading: isLoading }] = useMutation<ChatResponse>(CHAT);

    const [isSupported, setIsSupported] = useState(false);
    const isListening = micState === "listening";
    const isProcessing = micState === "processing";

    useEffect(() => {
      const supported =
        typeof window !== "undefined" &&
        ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
      setIsSupported(supported);
    }, []);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
      scrollToBottom();
    }, [messages]);

    // Speak bot messages automatically
    useEffect(() => {
      const lastBotMsg = [...messages].reverse().find((m) => m.sender === "bot");
      if (lastBotMsg && !speakingId) {
        setSpeakingId(lastBotMsg.id);
        speak(lastBotMsg.text).then(() => setSpeakingId(null));
      }
    }, [messages]);

    const handleSendMessage = async (text?: string) => {
      const msg = text || inputText;
      if (!msg.trim()) return;

      const userMessage: Message = {
        id: Date.now(),
        text: msg,
        sender: "user",
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText("");
      stopSpeaking();

      try {
        const { data } = await chat({ variables: { message: msg } });

        if (data?.chat?.success) {
          const botMessage: Message = {
            id: Date.now() + 1,
            text: data.chat.summary || "Here are your results.",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
            artifacts: data.chat.artifacts,
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          const botMessage: Message = {
            id: Date.now() + 1,
            text: "何かお手伝いできることはありますか？",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      } catch (error) {
        console.error("Chat error:", error);
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: "I'm here to help! What can I assist you with today?",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    };

    // Voice input
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
        stopSpeaking();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          }
        }
        if (final) {
          setInputText(final);
          setMicState("processing");
          handleSendMessage(final);
        }
      };

      recognition.onerror = (event: Event & { error: string }) => {
        console.error("Speech recognition error:", event.error);
        setMicState("idle");
      };

      recognition.onend = () => {
        if (micState === "listening") setMicState("idle");
      };

      recognitionRef.current = recognition;
      recognition.start();
    }, [isSupported, micState]);

    const stopListening = useCallback(() => {
      recognitionRef.current?.stop();
      setMicState("idle");
    }, []);

    const toggleListening = () => {
      if (isListening) stopListening();
      else if (!isProcessing) startListening();
    };

    const toggleSpeakMessage = (msg: Message) => {
      if (speakingId === msg.id) {
        stopSpeaking();
        setSpeakingId(null);
      } else {
        stopSpeaking();
        setSpeakingId(msg.id);
        speak(msg.text).then(() => setSpeakingId(null));
      }
    };

    useEffect(() => {
      return () => {
        recognitionRef.current?.abort();
        stopSpeaking();
      };
    }, []);

    const quickActions = [
      { text: "Find available listings", query: "What listings are available this weekend?" },
      { text: "Pricing information", query: "What are your pricing policies?" },
      { text: "Booking process", query: "How do I make a booking?" },
      { text: "Review guidelines", query: "How do I leave a review?" },
    ];

    const handleQuickAction = (query: string) => {
      setInputText(query);
      setTimeout(() => handleSendMessage(query), 100);
    };

    return (
      <>
        <Navbar />
        <div className="chatbot-container">
          {/* Toggle Button */}
          <button
            className="chatbot-toggle"
            onClick={() => setIsOpen(!isOpen)}
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "#3b82f6",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              zIndex: 1000,
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) =>
              ((e.target as HTMLElement).style.transform = "scale(1.1)")
            }
            onMouseLeave={(e) =>
              ((e.target as HTMLElement).style.transform = "scale(1)")
            }
          >
            💬
          </button>

          {/* Chat Window */}
          {isOpen && (
            <div
              style={{
                position: "fixed",
                bottom: "90px",
                right: "20px",
                width: "380px",
                height: "550px",
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                display: "flex",
                flexDirection: "column",
                zIndex: 1000,
                border: "1px solid #e5e7eb",
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: "16px",
                  background: "#3b82f6",
                  color: "white",
                  borderRadius: "12px 12px 0 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>Minshuku Assistant</strong>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    {isListening ? "Listening..." : isProcessing ? "Processing..." : "Always here to help!"}
                  </div>
                </div>
                <button
                  onClick={() => { setIsOpen(false); stopSpeaking(); setSpeakingId(null); }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "white",
                    fontSize: "18px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  padding: "16px",
                  overflowY: "auto",
                  background: "#f8f9fa",
                }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: message.sender === "user" ? "flex-end" : "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "80%",
                        padding: "10px 14px",
                        borderRadius:
                          message.sender === "user"
                            ? "18px 18px 4px 18px"
                            : "18px 18px 18px 4px",
                        background:
                          message.sender === "user" ? "#3b82f6" : "#e9ecef",
                        color: message.sender === "user" ? "white" : "#333",
                        fontSize: "14px",
                        lineHeight: "1.4",
                        position: "relative",
                      }}
                    >
                      {message.text}
                      {/* Speak button for bot messages */}
                      {message.sender === "bot" && (
                        <button
                          onClick={() => toggleSpeakMessage(message)}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: speakingId === message.id ? "#ef4444" : "#6b7280",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                          }}
                        >
                          {speakingId === message.id ? (
                            <VolumeX size={10} />
                          ) : (
                            <Volume2 size={10} />
                          )}
                        </button>
                      )}
                      <div
                        style={{
                          fontSize: "10px",
                          opacity: 0.7,
                          marginTop: "4px",
                          textAlign:
                            message.sender === "user" ? "right" : "left",
                        }}
                      >
                        {message.timestamp}
                      </div>
                    </div>
                    {/* Render artifacts for bot messages */}
                    {message.sender === "bot" && message.artifacts && message.artifacts.length > 0 && (
                      <div style={{ maxWidth: "90%", marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {message.artifacts.map((artifact, i) => (
                          <ArtifactCard key={i} artifact={artifact} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 14px",
                        borderRadius: "18px 18px 18px 4px",
                        background: "#e9ecef",
                        color: "#333",
                        fontSize: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div className="flex items-center gap-[2px]">
                          {[0, 1, 2, 3].map((i) => (
                            <div
                              key={i}
                              style={{
                                width: "3px",
                                borderRadius: "2px",
                                background: "#3b82f6",
                                height: "6px",
                                animation: `talkBar 0.${3 + i}s ease-in-out infinite alternate`,
                                animationDelay: `${i * 0.1}s`,
                              }}
                            />
                          ))}
                        </div>
                        Thinking...
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length === 1 && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderTop: "1px solid #e0e0e0",
                    background: "#f8f9fa",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginBottom: "8px",
                    }}
                  >
                    Quick actions:
                  </div>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                  >
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action.query)}
                        style={{
                          padding: "6px 10px",
                          background: "white",
                          border: "1px solid #ddd",
                          borderRadius: "16px",
                          fontSize: "11px",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                          transition: "background 0.3s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLElement).style.background =
                            "#f0f0f0")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLElement).style.background = "white")
                        }
                      >
                        {action.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input with mic */}
              <div
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #e0e0e0",
                  background: "white",
                }}
              >
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={
                      isListening
                        ? "Listening..."
                        : isProcessing
                          ? "Processing..."
                          : "Type or speak..."
                    }
                    disabled={isLoading || isProcessing}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: "1px solid #ddd",
                      borderRadius: "20px",
                      outline: "none",
                      fontSize: "14px",
                    }}
                  />

                  {/* Mic Button */}
                  {isSupported && (
                    <button
                      onClick={toggleListening}
                      disabled={isProcessing}
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        border: "none",
                        background: isListening ? "#ef4444" : isProcessing ? "#93c5fd" : "#e5e7eb",
                        color: isListening ? "white" : isProcessing ? "white" : "#6b7280",
                        cursor: isProcessing ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        position: "relative",
                        flexShrink: 0,
                      }}
                    >
                      {isProcessing ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isListening ? (
                        <MicOff size={16} />
                      ) : (
                        <Mic size={16} />
                      )}
                      {isListening && (
                        <div
                          style={{
                            position: "absolute",
                            inset: "-3px",
                            borderRadius: "50%",
                            border: "2px solid #ef4444",
                            opacity: 0.4,
                            animation: "ping 1s infinite",
                          }}
                        />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || isProcessing || !inputText.trim()}
                    style={{
                      padding: "10px 16px",
                      background: "#3b82f6",
                      border: "none",
                      borderRadius: "20px",
                      color: "white",
                      cursor: "pointer",
                      opacity: isLoading || isProcessing || !inputText.trim() ? 0.5 : 1,
                      transition: "background 0.3s",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) =>
                      !isLoading &&
                      inputText.trim() &&
                      ((e.target as HTMLElement).style.background = "#2563eb")
                    }
                    onMouseLeave={(e) =>
                      !isLoading &&
                      inputText.trim() &&
                      ((e.target as HTMLElement).style.background = "#3b82f6")
                    }
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}

          <style jsx>{`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
            @keyframes talkBar {
              0% { height: 4px; }
              100% { height: 14px; }
            }
            @keyframes ping {
              0% { transform: scale(1); opacity: 0.4; }
              75%, 100% { transform: scale(1.8); opacity: 0; }
            }
          `}</style>
        </div>
      </>
    );
  };

  return <Chatbot />;
}
