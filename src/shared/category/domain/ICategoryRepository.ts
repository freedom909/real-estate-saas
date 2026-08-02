import { Category } from "@/core/listing/domain/entities/category";


// ICategoryRepository.ts
export interface ICategoryRepository {
  findAll(): Promise<Category[]>;
  findByIds(ids: string[]): Promise<Category[]>;
}
