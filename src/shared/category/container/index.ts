// src/shared/category/container/index.ts

import { container } from "tsyringe";

import { CategoryRepository } from "../infrastructure/category.repository";
import { TOKENS_CATEGORY } from "@/modules/tokens/category.tokens";

container.register(TOKENS_CATEGORY.categoryRepository, {
  useClass: CategoryRepository,
});