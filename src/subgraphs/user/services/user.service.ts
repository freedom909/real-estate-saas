// src/subgraphs/user/services/user.service.ts

import { injectable, inject } from "tsyringe";
import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { IUserRepository } from "../domain/repository/IUserRepository";
import { UserResponse } from "./user.dto";
import { Role } from "@/core/shared/domain/role";

/**
 * Application service for User queries and commands.
 *
 * Thin orchestration layer — resolves the DDD repository,
 * delegates business logic to the entity, returns DTOs.
 */
@injectable()
export default class UserService {
  constructor(
    @inject(TOKENS_USER.repos.userRepository)
    private readonly userRepository: IUserRepository,
  ) {}

  // ── Queries ────────────────────────────────────────

  async findById(id: string): Promise<UserResponse | null> {
    // Support email-as-id (used by some legacy callers)
    const user = id.includes("@")
      ? await this.userRepository.findByEmail(id)
      : await this.userRepository.findById(id);
    return user ? this.toResponse(user) : null;
  }

  async userByEmail(email: string): Promise<UserResponse | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.toResponse(user) : null;
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<UserResponse[]> {
    const users = await this.userRepository.findAll(limit, offset);
    return users.map(this.toResponse);
  }

  async count(): Promise<number> {
    return this.userRepository.count();
  }

  // ── Commands ───────────────────────────────────────

  async create(input: {
    email: string;
    name: string;
    role?: Role;
    picture?: string;
  }): Promise<UserResponse> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("User with this email already exists");
    }
    const user = await this.userRepository.create(input);
    return this.toResponse(user);
  }

  async deactivate(userId: string): Promise<boolean> {
    return this.userRepository.deactivate(userId);
  }

  // ── Mapping ────────────────────────────────────────

  private toResponse(user: any): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      picture: user.picture,
      role: user.role,
      status: user.status,
      tokenVersion: user.tokenVersion,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
    };
  }
}
