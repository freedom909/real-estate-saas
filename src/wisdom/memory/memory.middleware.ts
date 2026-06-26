//src/wisdom/memory/memory.middleware.ts

import { container } from "tsyringe";
import { WISDOM_TOKENS } from "../container/tokens/wisdom.tokens";
import { MemoryStore } from "./memory.store";

export const memoryMiddleware = async (req, res, next) => {
  const userId = req.user?.userId;

  if (!userId) {
    req.memory = {};
    return next();
  }
  
  const memory = await container.resolve<MemoryStore>(WISDOM_TOKENS.memory.memoryStore);
  const memoryState = await memory.get(userId);
  console.log("MEMORY BEFORE REQUEST", memoryState);

  req.memory = memory || {};

  return next();
};