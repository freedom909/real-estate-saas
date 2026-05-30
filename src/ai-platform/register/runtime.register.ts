// src/gateway/cognition/register/runtime.register.ts
import { container, DependencyContainer } from "tsyringe";
import { SequentialRuntime } from "../domain/runtime/executors/sequential.runtime";


export function registerRuntimeDependencies( container: DependencyContainer): void {
  container.registerSingleton(SequentialRuntime);
}