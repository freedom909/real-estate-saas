// host.adapter.ts

import { injectable, inject } from 'tsyringe';



export interface HostAdapter {
  validateHostExists(hostId: string): Promise<boolean>;
}

@injectable()
class HostAdapterImpl implements HostAdapter {   
    async validateHostExists(hostId: string): Promise<boolean> {
        return true;
    }
}

export default HostAdapterImpl;