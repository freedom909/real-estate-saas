// FILE: src/modules/container/category.container.ts

import { container } from 'tsyringe';

import { TOKENS_LISTING } from '../tokens/listing.tokens';
import { TOKENS_CATEGORY } from '../tokens/category.tokens';
import { CategoryRepository } from '@/shared/category/infrastructure/category.repository';

  container.register(TOKENS_CATEGORY.categoryRepository, {
    useClass: CategoryRepository,
  });

export default container;

