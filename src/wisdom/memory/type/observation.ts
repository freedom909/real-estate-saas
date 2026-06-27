import { Intent } from "./intent";

// src/wisdom/memory/type/observation.ts
type Observation = {
  toolResult?: any;
  message?: string;
  intents?: Intent[];
  content?: string;
};