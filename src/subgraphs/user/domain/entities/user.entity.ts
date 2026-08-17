// src/subgraphs/user/domain/entities/user.entity.ts

import { Role } from "@/core/shared/domain/role";

/**
 * User entity — single source of truth for user domain logic.
 *
 * Mirrors the GraphQL `User` type and holds all persistence fields.
 * Business rules live here; persistence lives in the repository.
 */
export class UserEntity {
  private _role: Role;
  private _status: AccountStatus;
  private _isActive: boolean;

  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    role: Role,
    status: AccountStatus = AccountStatus.ACTIVE,
    isActive: boolean = true,
    public readonly picture: string = "",
    public readonly tokenVersion: number = 0,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {
    this._role = role;
    this._status = status;
    this._isActive = isActive;
  }

  // ── Getters ──────────────────────────────────────────

  get role(): Role { return this._role; }
  get status(): AccountStatus { return this._status; }
  get isActive(): boolean { return this._isActive; }

  // ── Business Methods ─────────────────────────────────

  /** Customer → Host role transition (idempotent). */
  becomeHost(): void {
    if (this._role === Role.ADMIN || this._role === Role.SUPER_ADMIN) {
      throw new Error("Admin cannot become host");
    }
    if (this._role === Role.HOST) return; // already a host
    this._role = Role.HOST;
    this.touch();
  }

  /** Promote to admin (requires higher-privilege caller — enforced at use-case level). */
  promoteToAdmin(): void {
    if (this._role === Role.SUPER_ADMIN) return; // already above admin
    this._role = Role.ADMIN;
    this.touch();
  }

  /** Soft-deactivate the account. */
  deactivate(): void {
    this._status = AccountStatus.SUSPENDED;
    this._isActive = false;
    this.touch();
  }

  /** Re-activate a suspended account. */
  activate(): void {
    this._status = AccountStatus.ACTIVE;
    this._isActive = true;
    this.touch();
  }

  // ── Internal ─────────────────────────────────────────

  private touch() {
    this.updatedAt = new Date();
  }
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
  BANNED = "BANNED",
  DELETED = "DELETED",
}
