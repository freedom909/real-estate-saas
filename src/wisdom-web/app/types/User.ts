// src/wisdom-web/app/types/User.ts
export interface User {
  id: number;
  email: string;
  role: "guest" | "host" | "admin";
  tenantId: string;   // ⭐关键字段
}