// src/subgraphs/user/domain/entities/becomeHost.ts

import { UserRole } from "@/core/user/domain/userRole";

export function becomeHost(): void {
  if (this.role === UserRole.ADMIN) {
    throw new Error("Admin cannot become host");
  }

  this.role = UserRole.HOST;
}