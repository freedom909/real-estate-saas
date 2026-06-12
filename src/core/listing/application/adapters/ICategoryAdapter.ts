// FILE: src/subgraphs/listing/adapters/ICategoryAdapter.ts

export interface ICategoryAdapter {
  getIdsByNames(names: string[]): Promise<string[]>;
}