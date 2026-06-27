// src/wisdom/memory/tool.registry.ts

export class ToolRegistry {
  private tools: Record<string, any> = {};

  register(name: string, tool: any) {
    this.tools[name] = tool;
  }

  async execute(plan: any) {
    if (plan.type === "response") {
      return plan.output;
    }

    if (plan.type === "tool_call") {
      const tool = this.tools[plan.tool];
      return await tool.run(plan.input);
    }

    return "unknown plan";
  }
}