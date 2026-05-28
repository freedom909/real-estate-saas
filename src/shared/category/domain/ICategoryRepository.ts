import { Category } from "@/subgraphs/listing/domain/entities/Category";

// ICategoryRepository.ts
export interface ICategoryRepository {
  findByIds(ids: string[]): Promise<Category[]>;
}