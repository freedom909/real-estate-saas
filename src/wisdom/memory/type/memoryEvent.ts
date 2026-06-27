// src/wisdom/memory/type/memoryEvent.ts

import { Intent } from "./intent";

export type MemoryEvent = {

    source:

        | "USER"

        | "ASSISTANT"

        | "TOOL"

        | "SYSTEM";

    type:

        | "CHAT"

        | "FACT"

        | "PREFERENCE"

        | "PLAN"

        | "OBSERVATION"

        | "SUMMARY"

        | "SEMANTIC"

        | "BOOKING_DRAFT"

        | "SEARCH"

        | "DELTA";

    payload:any;

    confidence?:number;

    timestamp:number;

}
