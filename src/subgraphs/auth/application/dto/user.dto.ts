// application/dto/user.dto.ts

export interface UserDTO {
  id: string;
  email?: string | null;

  // 风控相关
  riskLevel?: "LOW" | "MEDIUM" | "HIGH";
  lastLoginAt?: Date;

  // 行为特征（可选）
  loginCount?: number;
}