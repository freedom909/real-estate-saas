// src/core/admin/domain/entities/IAdminUserRepository.ts

import { AdminUser } from "./adminUser";

export interface IAdminUserRepository {
  create(admin: AdminUser): Promise<AdminUser>;
  findAll(): Promise<AdminUser[]>;
  findById(id: string): Promise<AdminUser | null>;
  findByEmail(email: string): Promise<AdminUser | null>;
  update(id: string, admin: AdminUser): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
