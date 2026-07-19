"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";

type Artifact = {
  type: string;
  content: any;
};

type SearchResult = {
  success: boolean;
  summary: string | null;
  artifacts: Artifact[];
};

type ChatWindowProps = {
  result: SearchResult | null;
};

function speak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing: any, i: number) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
        >
          <img
            src={listing.picture?.[0] || listing.image || listing.images?.[0] || "https://picsum.photos/400/250"}
            alt={listing.title || "Listing"}
            className="h-44 w-full object-cover"
          />
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800">
              {listing.title || "Untitled Listing"}
            </h3>
            {listing.description && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {listing.description}
              </p>
            )}
            {listing.address && (
              <p className="mt-1 text-xs text-gray-400">{listing.address}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-500">
              {listing.numOfBeds != null && <span>{listing.numOfBeds} bed{listing.numOfBeds > 1 ? "s" : ""}</span>}
              {listing.numOfBathrooms != null && <span>{listing.numOfBathrooms} bath</span>}
              {listing.numOfCustomers != null && <span>Up to {listing.numOfCustomers} guests</span>}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">
                ¥{listing.price}
              </span>
              {listing.isFeatured && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  Featured
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ArtifactCard({ artifact }: { artifact: Artifact }) {
  if (artifact.type === "LISTING_SEARCH_RESULT") {
    return <ListingResult content={artifact.content} />;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        {artifact.type.replace(/_/g, " ")}
      </span>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-sm text-gray-700">
        {typeof artifact.content === "string"
          ? artifact.content
          : JSON.stringify(artifact.content, null, 2)}
      </pre>
    </div>
  );
}

export default function ChatWindow({ result }: ChatWindowProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasSpokenRef = useRef<string>("");

  // Auto-speak new responses
  useEffect(() => {
    if (!result?.summary) return;

    // Don't re-speak the same summary
    if (hasSpokenRef.current === result.summary) return;
    hasSpokenRef.current = result.summary;

    // Stop any previous speech before starting new one
    stopSpeaking();
    setIsSpeaking(true);

    speak(result.summary).then(() => {
      setIsSpeaking(false);
    });

    return () => {
      stopSpeaking();
      setIsSpeaking(false);
    };
  }, [result?.summary]);

  if (!result) return null;

  return (
    <div className="mx-auto mt-8 w-full max-w-4xl px-4">
      {result.summary && (
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <p className="flex-1 text-lg leading-relaxed text-gray-700">
              {result.summary}
            </p>
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                  setIsSpeaking(false);
                } else {
                  stopSpeaking();
                  setIsSpeaking(true);
                  speak(result.summary!).then(() => setIsSpeaking(false));
                }
              }}
              className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
              title={isSpeaking ? "Stop speaking" : "Read aloud"}
            >
              {isSpeaking ? (
                <VolumeX size={20} className="text-red-500" />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
          </div>
          {isSpeaking && (
            <div className="mt-3 flex items-center gap-2 text-sm text-blue-500">
              <div className="flex items-center gap-[2px]">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-blue-400"
                    style={{
                      animation: `talkBar 0.${3 + i}s ease-in-out infinite alternate`,
                      animationDelay: `${i * 0.1}s`,
                      height: "6px",
                    }}
                  />
                ))}
              </div>
              Speaking...
            </div>
          )}
        </div>
      )}

      {result.artifacts.length > 0 && (
        <div className="space-y-4">
          {result.artifacts.map((artifact, i) => (
            <ArtifactCard key={i} artifact={artifact} />
          ))}
        </div>
      )}

      {!result.summary && result.artifacts.length === 0 && (
        <div className="rounded-2xl bg-white p-6 text-center shadow-md">
          <p className="text-gray-500">No results found. Try a different search.</p>
        </div>
      )}

      <style jsx>{`
        @keyframes talkBar {
          0% { height: 4px; }
          100% { height: 16px; }
        }
      `}</style>
    </div>
  );
}
