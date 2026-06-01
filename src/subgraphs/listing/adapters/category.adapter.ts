// src/subgraphs/listing/adapters/category.adapter.ts

import { injectable, inject } from "tsyringe";
import { ICategoryAdapter } from "./ICategoryAdapter";
import { ICategoryRepository } from "@/shared/category/domain/ICategory.repository";
import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";

@injectable()
export class CategoryAdapter implements ICategoryAdapter {
  constructor(
    @inject(TOKENS_CATEGORY.categoryRepository)
    private categoryRepository: ICategoryRepository
  ) {}

  async getIdsByNames(names: string[]): Promise<string[]> {
    return this.categoryRepository.getIdsByNames(names);
  }
}