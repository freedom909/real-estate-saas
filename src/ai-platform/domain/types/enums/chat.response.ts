import { UserContext } from "../../semantic/types/userContext";

export interface ChatResponse {
  success: boolean;
  planId: string;

  summary: Array<{
    id: string;
    capability: string;
    status: string;
  }>;

  userInfo?: UserContext;// 名前 'UserContext' が見つかりません。
  reply?: string;
}