// src/core/admin/infrastructure/mappers/adminUser.mapper.ts

import { AdminUser } from "../../domain/entities/adminUser";
import { Email } from "../../domain/value-objects/email";

export class AdminUserMapper {
  static toDomain(raw: any): AdminUser {
    return new AdminUser({
      id: raw.id,
      email: new Email(raw.email),
      name: raw.name,
      role: raw.role,
      avatar: raw.avatar,
      isActive: raw.isActive,
      lastLoginAt: raw.lastLoginAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(admin: AdminUser) {
    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      avatar: admin.avatar,
      isActive: admin.isActive,
      lastLoginAt: admin.lastLoginAt,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
    };
  }
}
