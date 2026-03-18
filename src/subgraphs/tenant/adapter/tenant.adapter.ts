import { injectable } from 'tsyringe';

@injectable()
export class TenantAdapter {
  async validateTenantExists(tenantId: string): Promise<boolean> {
    // Implementation would typically call the Tenant SDK
    return true; 
  }
}