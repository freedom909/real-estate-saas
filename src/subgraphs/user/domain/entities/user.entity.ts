// src/subgraphs/user/domain/entities/user.entity.ts

import { UserRole } from "@/core/user/domain/userRole";

export class UserEntity {
  private _role: UserRole;

  constructor(
    public readonly id: string,
    role: UserRole,
    public readonly createdAt: Date = new Date(),
  ) {
    this._role = role;
  }

  get role(): UserRole {
    return this._role;
  }

  becomeHost(): void {
    if (this._role === UserRole.ADMIN) {
      throw new Error("Admin cannot become host");
    }

    if (this._role === UserRole.HOST) {
      return;
    }

    this._role = UserRole.HOST;
  }
}