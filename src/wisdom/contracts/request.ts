// src/wisdom/contracts/request.ts

import { AIContext } from "./ai-context";

export interface WisdomRequest {
  message: string;
  context: AIContext;
}
