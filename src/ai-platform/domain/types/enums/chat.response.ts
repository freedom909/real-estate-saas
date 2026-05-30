

import { TaskStatus } from "../../planning/types/enums";


export interface ChatResponse {
  success: boolean;
  planId: string;
  summary: Array<{
    id: string;
    capability: string;
    status: TaskStatus;
  }>;
  userInfo:UserContext;
  reply?:string
}

export interface UserContext {
  userId: string;
  roles?: string[];
}