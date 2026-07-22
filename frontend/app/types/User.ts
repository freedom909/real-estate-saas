import { Role } from "./role";

// src/wisdom-web/app/types/User.ts
export interface User {
  id: number;
  email: string;
  role: Role;
  tenantId: string;   // ⭐关键字段
}