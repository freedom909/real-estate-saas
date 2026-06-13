import { SequentialRuntime } from "@/ai-platform/domain/runtime/executors/sequential.runtime";
import { SemanticContext } from "@/ai-platform/domain/semantic/semantic-context";


// src/ai-platform/domain/types/context/IRuntime.ts
export interface IRuntime {
  execute(context: SemanticContext): Promise<SemanticContext>;
}
export function sequentialRuntime(tasks: IRuntime[]): IRuntime {
  return new SequentialRuntime();
}

export function parallelRuntime(tasks: IRuntime[]): IRuntime {
  return new ParallelRuntime();
}

export function concurrentRuntime(tasks: IRuntime[]): IRuntime {
  return new ConcurrentRuntime(tasks);
}

