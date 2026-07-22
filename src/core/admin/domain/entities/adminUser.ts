// src/core/admin/domain/entities/adminUser.ts

import { Email } from "../value-objects/email";

export interface AdminUserProps {
  id: string;
  email: Email;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN" | "MODERATOR";
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminUser {
  private props: AdminUserProps;

  constructor(props: AdminUserProps) {
    this.validate(props);
    this.props = props;
  }

  get id() { return this.props.id; }
  get email() { return this.props.email.getValue(); }
  get name() { return this.props.name; }
  get role() { return this.props.role; }
  get avatar() { return this.props.avatar; }
  get isActive() { return this.props.isActive; }
  get lastLoginAt() { return this.props.lastLoginAt; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  updateName(name: string) {
    this.props.name = name;
    this.touch();
  }

  updateRole(role: "ADMIN" | "SUPER_ADMIN" | "MODERATOR") {
    this.props.role = role;
    this.touch();
  }

  deactivate() {
    this.props.isActive = false;
    this.touch();
  }

  activate() {
    this.props.isActive = true;
    this.touch();
  }

  recordLogin() {
    this.props.lastLoginAt = new Date();
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  private validate(props: AdminUserProps) {
    if (!props.id) throw new Error("AdminUser id required");
    if (!props.name) throw new Error("AdminUser name required");
  }
}
