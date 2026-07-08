// src/wisdom-web/app/types/role.ts
export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}