import { Intent } from "./intent";

// src/wisdom/memory/type/percerption.ts
type Perception = {
  intent: string;
  entities: Record<string, any>;
  taskType: "chat" | "search" | "booking" | "reasoning";
};

export interface PerceptionResult {

    intent: Intent;

    confidence:number;

    entities:Record<string,any>;

    constraints:Record<string,any>;

    missing:string[];

}