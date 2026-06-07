// src/ai-platform/resolvers/aiRequestFactory.ts

import { AIRequest } from "../domain/types/context/aiContext";

export enum InputSource {
    WEB = "web",
    MOBILE = "mobile",
    VOICE = "voice",
    API = "api"
}
export class AIRequestFactory {

    static fromGraphQL(input: any, context: any): AIRequest {

        return {
            message: input.message,

            context: {
                user: {
                    id: context.user?.id
                },

                source: InputSource.WEB,

                sessionId: context.sessionId,

                device: {
                    type: context.device?.type || "desktop"
                },

                resources: {
                    listingId: context.resources?.listingId,
                    bookingId: context.resources?.bookingId,
                    reviewId: context.resources?.reviewId
                },

                locale: context.locale,
                timezone: context.timezone
            }
        };
    }
    static fromMobile(payload: any): AIRequest {

        return {
            message: payload.text,

            context: {
                user: { id: payload.userId },

                source: "mobile",

                ui: {
                    screen: payload.screen
                },

                resources: payload.resources
            }
        };
    }

    static fromVoice(payload: any): AIRequest {

        return {
            message: payload.transcript,

            context: {
                user: { id: payload.userId },

                source: "voice",

                voice: {
                    transcriptConfidence: payload.confidence
                },

                device: {
                    type: "voice"
                },

                resources: payload.context?.resources
            }
        };
    }
}