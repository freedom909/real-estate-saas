// src/wisdom/memory/type/IVector.store.ts
export interface IVectorStore {
  upsert(doc: VectorDocument): Promise<void>;

  search(params: {
    userId: string;
    queryEmbedding: number[];
    topK?: number;
    filter?: Record<string, any>;
  }): Promise<VectorDocument[]>;
}

export type VectorDocument = {
  id: string;
  userId: string;
  content: string;
  embedding: number[];
  metadata?: Record<string, any>;
  createdAt: number;
};