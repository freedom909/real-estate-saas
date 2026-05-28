import { injectable } from 'tsyringe';

@injectable()
export class HostAdapter {
  async validateHostExists(hostId: string): Promise<boolean> {
    // Implementation would typically call the Host SDK
    return true; 
  }
}