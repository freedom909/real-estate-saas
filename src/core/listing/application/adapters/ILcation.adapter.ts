//src/core/listing/application/adapters/ILcation.adapter.ts

export interface ILocationAdapter {
  getValidId(id: number): Promise<number>;
}
