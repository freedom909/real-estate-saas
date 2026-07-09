import { injectable } from 'tsyringe';

@injectable()
export class TenantAdapter {
  async validateOwnerExists(ownerId: string): Promise<boolean> {
    // Implementation would typically call the Tenant SDK
    return true; 
  }
}