// src/subgraphs/user/domain/entities/hos.tProfile.ts

export class HostProfile {
  constructor(
    public readonly userId: string,
    public status: HostStatus = HostStatus.ACTIVE,
    public readonly createdAt: Date = new Date(),
  ) {}
}

export enum HostStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  SUSPENDED = "SUSPENDED",
}