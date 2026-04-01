// src/subgraphs/property/container/registerPropertyDependencies.ts

import { DependencyContainer } from 'tsyringe';
import { TOKENS_PROPERTY } from "@/modules/property/container/property.tokens";
import TenantAdapterImpl from '../adapters/tenant.adapter';

export function registerPropertyDependencies(container: DependencyContainer) {
container.register(TOKENS_PROPERTY.tenantAdapter, {
  useClass: TenantAdapterImpl,
});
}

export default registerPropertyDependencies;