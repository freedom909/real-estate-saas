import { MemoryManager } from "../memoryManager";
import { ToolRegistry } from "../tool.registry";
import { PerceptionEngine } from "../perception/perception.engine";
import { ReasoningEngine } from "./reasoning.engine";
import { ReflectionEngine } from "./reflection.engine";

export class CognitionEngine {
  constructor(
    private memory: MemoryManager,
    private reasoner: ReasoningEngine,
    private tools: ToolRegistry,
    private reflector: ReflectionEngine,
    private perceiver: PerceptionEngine,
  ) {}

  async run(input: any, context: any) {
    // 1. perception
    const perception = this.perceiver.perceive(input);

    // 2. memory load
    const memory = await this.memory.load(context.userId);

    // 3. state
    const state = {
      input,
      memory,
      perception,
      userId: context.userId,
    };

    // 4. reasoning
    const plan = await this.reasoner.think(state);

    // 5. execution
    const observation = await this.tools.execute(plan);

    // 6. reflection
    const reflection = this.reflector.reflect(observation);

    // 7. memory write-back
    await this.memory.write(context.userId, {
      source: "ASSISTANT",
      type: "CHAT",
      payload: {
        role: "assistant",
        content: observation,
      },
      timestamp: Date.now(),
    });

    return {
      output: observation,
      reflection,
    };
  }
}
