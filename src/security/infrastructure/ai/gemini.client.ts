// security/infrastructure/ai/gemini.client.ts

import { AIClient } from "@/security/aiClient";
import axios from "axios";
import { inject, injectable } from "tsyringe";

@injectable()
export class GeminiClient implements AIClient {

    constructor(
        @inject("GEMINI_API_KEY")
        private readonly apiKey: string
    ) {}

    async generate(prompt: string): Promise<string> {

        const res = await axios.post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                contents: [
                    {
                        parts: [
                            {
                                text: prompt
                            }
                        ]
                    }
                ]
            },
            {
                params: {
                    key: this.apiKey
                }
            }
        );

        return (
            res.data.candidates?.[0]
                ?.content?.parts?.[0]
                ?.text ?? ""
        );
    }
}