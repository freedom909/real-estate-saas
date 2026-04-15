// FILE: src/subgraphs/listing/container/index.ts

import { container } from 'tsyringe';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';
import ListingModel from '../../subgraphs/listing/infrastructure/models/listing.model';
import {ListingRepository} from '../../subgraphs/listing/infrastructure/persistence/listing.repository';
import CreateListingUseCase from '../../subgraphs/listing/application/use-cases/CreateListingUseCase';
import GetListingUseCase from '../../subgraphs/listing/application/use-cases/GetListingUseCase';


export default function registerListingDependencies() {
  container.register(TOKENS_LISTING.ListingModel, {
    useValue: ListingModel,
  });

  container.register(TOKENS_LISTING.ListingRepository, {
    useClass: ListingRepository,
  });

container.register(TOKENS_LISTING.CreateListingUseCase, {
  useClass: CreateListingUseCase,
});

container.register(TOKENS_LISTING.GetListingUseCase, {
  useClass: GetListingUseCase,
});
}