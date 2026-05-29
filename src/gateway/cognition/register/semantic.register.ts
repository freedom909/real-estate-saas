// src/gateway/cognition/register/semantic.register.ts
import { container, DependencyContainer } from "tsyringe";
import { ISemanticExtractor } from "../domain/semantic/types/i-semantic.extractor";
import { SemanticExtractor } from "../domain/semantic/extractors/semantic.extractor";


export function registerSemanticDependencies( container: DependencyContainer): void {
  container.registerSingleton<ISemanticExtractor>("ISemanticExtractor", SemanticExtractor);
  container.registerSingleton(SemanticExtractor);
}