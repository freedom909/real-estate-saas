"use client";

import { useState } from "react";
import { textToImage, imageToImage, inpaint } from "../services/imageGen";

type Tab = "txt2img" | "img2img" | "inpaint";

export default function ImageGenerator() {
  const [tab, setTab] = useState<Tab>("txt2img");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("blurry, low quality, distorted");
  const [strength, setStrength] = useState(0.75);
  const [steps, setSteps] = useState(30);
  const [guidance, setGuidance] = useState(7.5);
  const [seed, setSeed] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [maskFile, setMaskFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const params = {
        prompt,
        negative_prompt: negativePrompt,
        num_inference_steps: steps,
        guidance_scale: guidance,
        seed: seed !== "" ? seed : undefined,
      };

      let res;
      if (tab === "txt2img") {
        res = await textToImage(params);
      } else if (tab === "img2img") {
        if (!imageFile) {
          setError("Please upload an image");
          setLoading(false);
          return;
        }
        res = await imageToImage({ ...params, strength }, imageFile);
      } else {
        if (!imageFile || !maskFile) {
          setError("Please upload both image and mask");
          setLoading(false);
          return;
        }
        res = await inpaint({ ...params, strength }, imageFile, maskFile);
      }

      setResult(res.image_url);
    } catch (e: any) {
      setError(e.message || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Property Image Generator</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["txt2img", "img2img", "inpaint"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium ${
              tab === t
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t === "txt2img" ? "Text to Image" : t === "img2img" ? "Image to Image" : "Inpainting"}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
        {/* Prompt */}
        <div>
          <label className="block text-sm font-medium mb-1">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A beautiful modern apartment with large windows, professional real estate photography..."
            className="w-full border rounded-lg p-3 h-24 resize-none"
          />
        </div>

        {/* Negative Prompt */}
        <div>
          <label className="block text-sm font-medium mb-1">Negative Prompt</label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Image Upload (img2img & inpaint) */}
        {(tab === "img2img" || tab === "inpaint") && (
          <div>
            <label className="block text-sm font-medium mb-1">Source Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full border rounded-lg p-3"
            />
          </div>
        )}

        {/* Mask Upload (inpaint only) */}
        {tab === "inpaint" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Mask Image <span className="text-gray-500">(white = inpaint, black = keep)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMaskFile(e.target.files?.[0] || null)}
              className="w-full border rounded-lg p-3"
            />
          </div>
        )}

        {/* Settings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(tab === "img2img" || tab === "inpaint") && (
            <div>
              <label className="block text-sm font-medium mb-1">Strength</label>
              <input
                type="number"
                value={strength}
                onChange={(e) => setStrength(parseFloat(e.target.value))}
                min="0"
                max="1"
                step="0.05"
                className="w-full border rounded-lg p-3"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Steps</label>
            <input
              type="number"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value))}
              min="1"
              max="100"
              className="w-full border rounded-lg p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Guidance</label>
            <input
              type="number"
              value={guidance}
              onChange={(e) => setGuidance(parseFloat(e.target.value))}
              min="1"
              max="20"
              step="0.5"
              className="w-full border rounded-lg p-3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Seed (optional)</label>
            <input
              type="number"
              value={seed}
              onChange={(e) => setSeed(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full border rounded-lg p-3"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate Image"}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg">{error}</div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Result</h3>
            <img
              src={result}
              alt="Generated"
              className="w-full rounded-lg border"
            />
          </div>
        )}
      </div>
    </div>
  );
}
