import { container, DependencyContainer }
  from "tsyringe";
import { registerSemanticDependencies } from "./semantic.register";
import { registerPlannerDependencies } from "./planner.register";
import { registerAgentDependencies } from "./agent.register";
import { registerOrchestrationDependencies } from "./orchestration.register";
import { registerRuntimeDependencies } from "./runtime.register";
import { ChatUseCase } from "../application/use-cases/chat.use-case";

export function initializeCognitionContainer(
  parentContainer:
    DependencyContainer = container
): DependencyContainer {

  registerSemanticDependencies(
    parentContainer
  );

  registerPlannerDependencies(
    parentContainer
  );

  registerAgentDependencies(
    parentContainer
  );

  registerOrchestrationDependencies(
    parentContainer
  );

  registerRuntimeDependencies(
    parentContainer
  );

  parentContainer
    .registerSingleton(
      ChatUseCase
    );

  return parentContainer;
}