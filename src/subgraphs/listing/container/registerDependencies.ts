// src/subgraphs/Listing/container/registerListingDependencies.ts

import { DependencyContainer } from 'tsyringe';
import { TOKENS_Listing } from "@/modules/Listing/container/Listing.tokens";
import TenantAdapterImpl from '../adapters/tenant.adapter';

export function registerListingDependencies(container: DependencyContainer) {
container.register(TOKENS_Listing.tenantAdapter, {
  useClass: TenantAdapterImpl,
});
}

export default registerListingDependencies;