// src/subgraphs/listing/adapters/category.adapter.ts

import { injectable, inject } from "tsyringe";
import { ICategoryAdapter } from "./ICategoryAdapter";
import { ICategoryRepository } from "@/shared/category/domain/ICategoryRepository";
import { TOKENS_CATEGORY } from "@/modules/tokens/ai/category.tokens";

@injectable()
export class CategoryAdapter implements ICategoryAdapter {
  constructor(
    @inject(TOKENS_CATEGORY.CategoryRepository)
    private categoryRepository: ICategoryRepository
  ) {}

  async getIdsByNames(names: string[]): Promise<string[]> {
    return this.categoryRepository.getIdsByNames(names);
  }
}