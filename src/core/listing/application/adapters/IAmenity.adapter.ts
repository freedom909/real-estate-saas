// FILE: src/subgraphs/listing/adapters/IAmenity.adapter.ts
export interface IAmenityAdapter {
  getValidIds(ids: number[]): Promise<number[]>;
}