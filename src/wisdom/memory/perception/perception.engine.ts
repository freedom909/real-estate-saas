import { AIRequest } from "@/wisdom/contracts/ai-context";

// src/wisdom/memory/engine/perception.engine.ts
export class PerceptionEngine {
  perceive(input: any) {
    return {
intent:

                this.extractIntent(input),

            entities:

                this.extractEntities(input),

            constraints:

                this.extractConstraints(input),

            missing:[]

    };
  }

  private detectIntent(message: string) {
    if (message.includes("book")) return "booking";
    if (message.includes("search")) return "search";
    return "chat";
  }

  private extractEntities(message: string) {
    return {};
  }

  private extractIntent(input:AIRequest){
    return this.detectIntent(input.message);  
}

private extractConstraints(input:AIRequest){
    return {};
}
}