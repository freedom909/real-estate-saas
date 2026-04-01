// tenant.adapter.ts

import { injectable, inject } from 'tsyringe';



export interface TenantAdapter {
  validateTenantExists(tenantId: string): Promise<boolean>;
}

@injectable()
class TenantAdapterImpl implements TenantAdapter {   
    async validateTenantExists(tenantId: string): Promise<boolean> {
        return true;
    }
}

export default TenantAdapterImpl;