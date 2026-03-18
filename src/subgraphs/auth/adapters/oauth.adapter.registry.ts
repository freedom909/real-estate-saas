import { injectable } from "tsyringe";
import { OAuthAdapter } from "./oauth/oauth.adapter";
import { OAuthProvider } from "./oauth/oauth.provider";

@injectable()

class OAuthAdapterRegistry {
  
    
  private adapters = new Map<OAuthProvider, OAuthAdapter>();
 
  register(provider: OAuthProvider, adapter: OAuthAdapter) {
    this.adapters.set(provider, adapter);
  }
 
  get(provider: OAuthProvider) : OAuthAdapter {
    console.log("available adapters:", this.adapters); // 👈 加这个
    const adapter = this.adapters.get(provider);

    if (!adapter) {
      throw new Error(`OAuth adapter not found: ${provider}`);
    }
console.log("adapter type:", typeof adapter);
console.log("adapter:", adapter);
    return adapter;
  }
  debug() {
    console.log("available adapters:", [...this.adapters.keys()]);
  }
}
export default OAuthAdapterRegistry;