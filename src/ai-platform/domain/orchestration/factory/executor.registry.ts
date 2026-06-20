export interface CapabilityExecutor {
  execute(...args: any[]): Promise<any>;
}

export interface ExecutorClass {
  new (...args: any[]): CapabilityExecutor;
}

export class ExecutorRegistry {
  private registry: Map<string, ExecutorClass> = new Map();
  private containerResolver?: (token: any) => any;

  register(executorId: string, executorClass: ExecutorClass): void {
    this.registry.set(executorId, executorClass);
  }

  setContainerResolver(resolver: (token: any) => any): void {
    this.containerResolver = resolver;
  }

  create(executorId: string): CapabilityExecutor {
    const ExecutorCls = this.registry.get(executorId);
    if (!ExecutorCls) {
      throw new Error(`Executor not registered: ${executorId}`);
    }

    if (this.containerResolver) {
      try {
        return this.containerResolver(ExecutorCls) as CapabilityExecutor;
      } catch (e) {
        console.warn("Container resolver failed, falling back to direct instantiation");
      }
    }

    return new ExecutorCls();
  }

  has(executorId: string): boolean {
    return this.registry.has(executorId);
  }

  list(): string[] {
    return Array.from(this.registry.keys());
  }
}
