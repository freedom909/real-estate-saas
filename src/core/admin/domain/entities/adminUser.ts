// src/core/admin/domain/entities/adminUser.ts

import { Email } from "../value-objects/email";

export interface AdminUserProps {
  id: string;
  email: Email;
  name: string;
  role: "ADMIN" | "SUPER_ADMIN" | "STAFF" | "AGENT" | "CUSTOMER";
  avatar?: string;
  isActive: boolean;
  immutable: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminUser {
  private props: AdminUserProps;

  constructor(props: AdminUserProps) {
 this.props = {

        ...props,

        immutable: props.immutable ?? false,

    };

    this.validate(this.props);
  }

  get id() { return this.props.id; }
  get email() { return this.props.email.getValue(); }
  get name() { return this.props.name; }
  get role() { return this.props.role; }
  get avatar() { return this.props.avatar; }
  get isActive() { return this.props.isActive; }
  get immutable() { return this.props.immutable; }
  get lastLoginAt() { return this.props.lastLoginAt; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  updateName(name: string) {
    this.props.name = name;
    this.touch();
  }

  updateRole(role: "ADMIN" | "SUPER_ADMIN" | "STAFF" | "AGENT" | "CUSTOMER") {
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
    if (!props.email) throw new Error("AdminUser email required");
    if (!props.name) throw new Error("AdminUser name required");
    if (!props.role) throw new Error("AdminUser role required");
    if (props.isActive === undefined) throw new Error("AdminUser isActive required");
    if (props.immutable === undefined) throw new Error("AdminUser immutable required");
    if (!props.createdAt) throw new Error("AdminUser createdAt required");
    if (!props.updatedAt) throw new Error("AdminUser updatedAt required");
    
    if (!props.email.getValue()) throw new Error("AdminUser email required");
    if (!props.name) throw new Error("AdminUser name required");
  }
}
