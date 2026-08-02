import { Role } from "@/core/shared/domain/role";

export  interface IProfile {
  userId: string;
  email: string;
  name: string;
  avatar: string;
}

export interface IUser {
  lastLoginAt: Date;
  immutable: boolean;
  id: string;
  profile: IProfile;
  role: Role;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}
