// src/core/shared/application/transaction/i-transaction-manager.ts

export interface ITransactionManager {
  run<T>(work: () => Promise<T>): Promise<T>;
}