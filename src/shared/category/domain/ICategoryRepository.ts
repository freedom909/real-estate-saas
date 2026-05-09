import { Category } from "./Category";

// ICategoryRepository.ts
export interface ICategoryRepository {
  findByIds(ids: string[]): Promise<Category[]>;
  getIdsByNames(names: string[]): Promise<string[]>;
}