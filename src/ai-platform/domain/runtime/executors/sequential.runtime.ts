// src/ai-platform/domain/runtime/executors/sequential.runtime.ts

import { SemanticContext } from "../../semantic/semantic-context";
import { IRuntime } from "../../types/context/IRuntime";

export class SequentialRuntime implements IRuntime {
  async execute( context: SemanticContext): Promise<SemanticContext> {

    return context;
  }
}