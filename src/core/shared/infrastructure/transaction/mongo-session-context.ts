// src/core/shared/infrastructure/transaction/mongo-session-context.ts

import { AsyncLocalStorage } from "node:async_hooks";
import { ClientSession } from "mongoose";

const sessionStorage = new AsyncLocalStorage<ClientSession>();

export function runWithMongoSession<T>(
  session: ClientSession,
  work: () => Promise<T>
): Promise<T> {
  return sessionStorage.run(session, work);
}

export function getMongoSession(): ClientSession | undefined {
  return sessionStorage.getStore();
}