export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED',
}

export interface TenantProps {
  id?: string;
  name: string;
  slug: string;
  status: TenantStatus;
  ownerUserId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Tenant {
  constructor(private props: TenantProps) {}

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get slug() { return this.props.slug; }
  get status() { return this.props.status; }
  get ownerUserId() { return this.props.ownerUserId; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  public rename(newName: string) {
    if (this.props.status !== TenantStatus.ACTIVE) {
      throw new Error("Only ACTIVE tenants can be renamed.");
    }
    this.props.name = newName;
  }

  public suspend() {
    this.props.status = TenantStatus.SUSPENDED;
  }

  public activate() {
    this.props.status = TenantStatus.ACTIVE;
  }

  public toJSON() { return { ...this.props }; }
}