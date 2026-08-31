import { Category } from "./category";


// ICategoryRepository.ts
export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findByIds(ids: string[]): Promise<Category[]>;
  getIdsByNames(names: string[]): Promise<string[]>;
}
