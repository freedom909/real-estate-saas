// src/subgraphs/user/infra/mappers/user.mapper.ts

import { UserEntity, AccountStatus } from "../../domain/entities/user.entity";
import { Role } from "@/core/shared/domain/role";

/**
 * Maps between Mongoose document (IUserDB) ↔ UserEntity.
 *
 * Follows the ListingMapper pattern:
 *   toDomain(raw)      — DB → Domain
 *   toPersistence(entity) — Domain → DB-ready plain object
 */
export class UserMapper {
  /** Mongoose document → UserEntity */
  static toDomain(raw: any): UserEntity {
    return new UserEntity(
      raw._id?.toString() ?? raw.id,
      raw.email,
      raw.name,
      (raw.role as Role) ?? Role.CUSTOMER, // is this right? or should it be HOST? or something else?
      (raw.status as AccountStatus) ?? AccountStatus.ACTIVE,
      raw.isActive ?? true,
      raw.picture ?? "",
      raw.tokenVersion ?? 0,
      raw.createdAt ?? new Date(),
      raw.updatedAt ?? new Date(),
    );
  }

  /** UserEntity → plain object suitable for Mongoose update */
  static toPersistence(entity: UserEntity) {
    return {
      email: entity.email,
      name: entity.name,
      role: entity.role,
      status: entity.status,
      isActive: entity.isActive,
      picture: entity.picture,
      tokenVersion: entity.tokenVersion,
      updatedAt: entity.updatedAt,
    };
  }
}
