// src/wisdom/memory/reasoning.engine.ts

export class ReasoningEngine {
  async think(state: any) {
    const intent = state.perception.intent;

    if (intent === "booking") {
      return {
        type: "tool_call",
        tool: "bookingTool",
        input: state.input,
      };
    }

    return {
      type: "response",
      output: `I understand: ${state.input.message}`,
    };
  }
}