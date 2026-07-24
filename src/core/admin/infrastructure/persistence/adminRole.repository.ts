// src/core/admin/infrastructure/persistence/adminUser.repository.ts

import { injectable, inject } from "tsyringe";
import { AdminUserMapper } from "../mappers/adminUser.mapper";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";
import { IAdminUserRepository } from "../../domain/entities/IAdminUserRepository";
import { AdminUser } from "../../domain/entities/adminUser";
import AdminUserModel from "../models/adminUser.model";
import { AdminRole } from "../../domain/entities/adminRole";

@injectable()
export class AdminUserRepository implements IAdminUserRepository {
  constructor(
    @inject(TOKENS_ADMIN.models.adminUserModel)
    private model: typeof AdminUserModel
  ) {}
  async promoteUserToAdmin(userId: string): Promise<void> {
    await this.model.update({ role: AdminRole.ADMIN }, { where: { id: userId } });
  }
  async demoteAdminToUser(userId: string): Promise<void> {
    await this.model.update({ role: AdminRole.CUSTOMER }, { where: { id: userId } });
  }
  async countByRole(role: AdminRole): Promise<number> {
    return await this.model.count({
        where: { role }
    });
  }

  async create(admin: AdminUser): Promise<AdminUser> {
    const persistence = AdminUserMapper.toPersistence(admin);
    const created = await this.model.create(persistence);
    return AdminUserMapper.toDomain(created);
  }

  async findAll(): Promise<AdminUser[]> {
    const records = await this.model.findAll({ order: [["createdAt", "DESC"]] });
    return records.map((r) => AdminUserMapper.toDomain(r));
  }

  async findById(id: string): Promise<AdminUser | null> {
    const record = await this.model.findByPk(id);
    return record ? AdminUserMapper.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    const record = await this.model.findOne({ where: { email } });
    return record ? AdminUserMapper.toDomain(record) : null;
  }

  async update(id: string, admin: AdminUser): Promise<boolean> {
    const raw = AdminUserMapper.toPersistence(admin);
    const [affectedCount] = await this.model.update(raw, { where: { id } });
    return affectedCount > 0;
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.model.destroy({ where: { id } });
    return deletedCount > 0;
  }
}
