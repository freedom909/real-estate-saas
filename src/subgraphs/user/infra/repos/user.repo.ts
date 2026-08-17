// src/subgraphs/user/infra/repos/user.repo.ts

import { Model } from "mongoose";
import { inject, injectable } from "tsyringe";

import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { UserEntity } from "../../domain/entities/user.entity";
import { IUserRepository } from "../../domain/repository/IUserRepository";
import { UserMapper } from "../mappers/user.mapper";
import { Role } from "@/core/shared/domain/role";

/**
 * Concrete repository for the User aggregate.
 *
 * Implements the DDD IUserRepository interface.
 * All methods map through UserMapper — never exposes DB objects to callers.
 */
@injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @inject(TOKENS_USER.models.user)
    private readonly model: Model<any>,
  ) {}

  // ── Read ───────────────────────────────────────────

  async findById(id: string): Promise<UserEntity | null> {
    const raw = await this.model.findById(id);
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const raw = await this.model.findOne({ email: email.toLowerCase() });
    return raw ? UserMapper.toDomain(raw) : null;
  }

  async findAll(limit: number = 50, offset: number = 0): Promise<UserEntity[]> {
    const raws = await this.model.find().sort({ createdAt: -1 }).skip(offset).limit(limit);
    return raws.map(UserMapper.toDomain);
  }

  async count(): Promise<number> {
    return this.model.countDocuments();
  }

  // ── Write ──────────────────────────────────────────

  async create(data: {
    email: string;
    name: string;
    role?: Role;
    picture?: string;
  }): Promise<UserEntity> {
    const raw = await this.model.create({
      email: data.email.toLowerCase(),
      name: data.name,
      role: data.role ?? Role.CUSTOMER,
      picture: data.picture ?? "",
      status: "ACTIVE",
      isActive: true,
      tokenVersion: 0,
    });
    return UserMapper.toDomain(raw);
  }

  async save(user: UserEntity): Promise<void> {
    await this.model.findByIdAndUpdate(
      user.id,
      { $set: UserMapper.toPersistence(user) },
    );
  }

  async setUserRole(userId: string, role: Role): Promise<void> {
    await this.model.findByIdAndUpdate(userId, { role });
  }

  async deactivate(userId: string): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(
      userId,
      { status: "SUSPENDED", isActive: false },
      { new: true },
    );
    return !!result;
  }

  async activate(userId: string): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(
      userId,
      { status: "ACTIVE", isActive: true },
      { new: true },
    );
    return !!result;
  }
}
