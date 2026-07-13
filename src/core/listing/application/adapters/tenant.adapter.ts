// host.adapter.ts

import { injectable, inject } from 'tsyringe';



export interface OwnerAdapter {
  validateOwnerExists(ownerId: string): Promise<boolean>;
}

@injectable()
class OwnerAdapterImpl implements OwnerAdapter {   
    async validateOwnerExists(ownerId: string): Promise<boolean> {
        return true;
    }
}

export default OwnerAdapterImpl;