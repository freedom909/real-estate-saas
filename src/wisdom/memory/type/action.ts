// src/wisdom/memory/type/action.ts
type Action = {
  type: "tool_call" | "response";
  tool?: string;
  input?: any;
};