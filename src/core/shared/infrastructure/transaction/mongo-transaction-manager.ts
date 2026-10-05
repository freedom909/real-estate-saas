// src/core/shared/infrastructure/transaction/mongo-transaction-manager.ts

import { injectable } from "tsyringe";
import mongoose from "mongoose";

import { ITransactionManager } from "../../application/transaction/i-transaction-manager";
import { runWithMongoSession } from "./mongo-session-context";

@injectable()
export class MongoTransactionManager implements ITransactionManager {
  async run<T>(work: () => Promise<T>): Promise<T> {
    const session = await mongoose.startSession();

    try {
      let result!: T;

      await session.withTransaction(async () => {
        result = await runWithMongoSession(
          session,
          work
        );
      });

      return result;
    } finally {
      await session.endSession();
    }
  }
}