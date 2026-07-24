// src/core/admin/domain/entities/IAdminUserRepository.ts


import { AdminRole } from "./adminRole";
import { AdminUser } from "./adminUser";

export interface IAdminUserRepository {
  promoteUserToAdmin(userId: string): Promise<void>;
  demoteAdminToUser(userId: string): Promise<void>;
  create(admin: AdminUser): Promise<AdminUser>;
  findAll(): Promise<AdminUser[]>;
  findById(id: string): Promise<AdminUser | null>;
  findByEmail(email: string): Promise<AdminUser | null>;
  update(id: string, admin: AdminUser): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  countByRole(role: AdminRole): Promise<number>;
}
