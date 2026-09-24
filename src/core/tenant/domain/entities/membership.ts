import { MembershipRole } from "@/core/shared/domain/role";

export type MembershipStatus =
  | "ACTIVE"
  | "PENDING"
  | "SUSPENDED"
  | "REMOVED";

export class Membership {
  constructor(
    public readonly userId: string,
    public readonly tenantId: string,
    public role: MembershipRole,
    public status: MembershipStatus = "ACTIVE",
  ) {}
}