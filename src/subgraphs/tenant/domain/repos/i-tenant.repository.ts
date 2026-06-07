import { Tenant, TenantStatus } from "../entities/tenant.entity";

export interface TenantPaginationResult {
  items: Tenant[];
  total: number;
}

export interface ITenantRepository {
  save(tenant: Tenant): Promise<Tenant>;
  findById(id: string): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  update(tenant: Tenant): Promise<Tenant>;
  findAll(): Promise<Tenant[]>;
  paginate(filter: { 
    keyword?: string; 
    status?: TenantStatus; 
    limit: number; 
    offset: number 
  }): Promise<TenantPaginationResult>;
}
