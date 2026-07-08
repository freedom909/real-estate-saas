import { Role } from "@/wisdom-web/app/types/role";
import { UserRole } from "../userRole";

export  interface IProfile {
  userId: string;
  email: string;
  name: string;
  avatar: string;
}

export interface IUser {
  id: string;
  profile: IProfile;
  role: Role;
  status: "ACTIVE" | "INACTIVE" | "BANNED";
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
}