// src/core/admin/domain/entities/IAdminUserRepository.ts


import { IUserDB } from "@/subgraphs/user/infra/models/user.model";
import { Model, Document, DefaultSchemaOptions, Types } from "mongoose";
import { AdminRole } from "./adminRole";
import { AdminUser } from "./adminUser";
import { IUser } from "@/core/user/domain/user";

export interface IAdminUserRepository {  
  createAdmin(admin: IUser): Promise<AdminUser>;
  findAll(): Promise<AdminUser[]>;
  findById(id: string): Promise<AdminUser | null>;
  findByEmail(email: string): Promise<AdminUser | null>;
  update(id: string, admin: AdminUser): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  countByRole(role: AdminRole): Promise<number>;
}
