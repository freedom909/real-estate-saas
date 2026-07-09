// host.adapter.ts

import { injectable, inject } from 'tsyringe';



export interface OwnerAdapter {
  validateOwnerExists(hostId: string): Promise<boolean>;
}

@injectable()
class OwnerAdapterImpl implements OwnerAdapter {   
    async validateOwnerExists(hostId: string): Promise<boolean> {
        return true;
    }
}

export default OwnerAdapterImpl;