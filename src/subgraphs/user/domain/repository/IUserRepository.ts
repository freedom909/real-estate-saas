// src/subgraphs/user/domain/repository/IUserRepository.ts

import { UserEntity } from "../entities/user.entity";
import { Role } from "@/core/shared/domain/role";

/**
 * Single repository interface for the User aggregate.
 *
 * All methods work with domain entities — never with DB objects.
 * Persistence details are hidden behind this contract.
 */
export interface IUserRepository {
  // ── Read ───────────────────────────────────────────
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findAll(limit: number, offset: number): Promise<UserEntity[]>;
  count(): Promise<number>;

  // ── Write ──────────────────────────────────────────
  create(data: {
    email: string;
    name: string;
    role?: Role;
    picture?: string;
  }): Promise<UserEntity>;

  save(user: UserEntity): Promise<void>;

  /** Direct role update (used by admin/promotion flows). */
  setUserRole(userId: string, role: Role): Promise<void>;

  deactivate(userId: string): Promise<boolean>;
  activate(userId: string): Promise<boolean>;
}
