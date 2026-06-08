// src/gateway/cognition/register/orchestration.register.ts
import { container, DependencyContainer } from "tsyringe";
import { AgentRouterService } from "../domain/orchestration/router/agentRouter.service";



export function registerOrchestrationDependencies( container: DependencyContainer): void {
  container.registerSingleton(AgentRouterService);
}