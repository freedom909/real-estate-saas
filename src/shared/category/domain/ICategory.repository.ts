import { Category } from "@/subgraphs/listing/domain/entities/category";

// ICategoryRepository.ts
export interface ICategoryRepository {
  findByIds(ids: string[]): Promise<Category[]>;
  getIdsByNames(names: string[]): Promise<string[]>;

}