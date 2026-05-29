// src/gateway/cognition/application/dto/chat.response.ts

import { TaskStatus } from "../../planning/types/enums";


export interface ChatResponse {
  success: boolean;
  planId: string;
  summary: Array<{
    id: string;
    capability: string;
    status: TaskStatus;
  }>;
}