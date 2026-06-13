import { Category } from "@/core/listing/domain/entities/category";


// ICategoryRepository.ts
export interface ICategoryRepository {
  findByIds(ids: string[]): Promise<Category[]>;
}