export class Membership {
  status: MembershipStatus;
  tenantId: number;
  userId: number;
  role: string;
}

export type MembershipStatus =
  | "ACTIVE"
  | "PENDING"
  | "SUSPENDED"
  | "REMOVED"