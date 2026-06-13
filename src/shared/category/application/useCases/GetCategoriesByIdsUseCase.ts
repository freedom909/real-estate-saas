// getCategoriesByIds.useCase.ts

import { injectable, inject } from "tsyringe";


import { ICategoryRepository } from "../../domain/ICategoryRepository";
import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";

@injectable()
class GetCategoriesByIdsUseCase {
  constructor(
    @inject(TOKENS_CATEGORY.categoryRepository)
    private repo: ICategoryRepository
  ) {}

  async execute(ids: string[]) {
    return this.repo.findByIds(ids);
  }
}

export default GetCategoriesByIdsUseCase;