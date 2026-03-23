import "reflect-metadata"
import { container, DependencyContainer } from "tsyringe";

export function createTestContainer(): DependencyContainer {
  const child = container.createChildContainer();
  return child;
}