import { container } from 'tsyringe';
import { TOKENS_LISTING } from '@/modules/tokens/listing.tokens';

import CreateListingUseCase from './CreateListingUseCase';
import { ListingRepository } from '../../infrastructure/persistence/listing.repository';
import Listing from '../../infrastructure/models/listing.model';


export function registerListingDependencies() {
  container.register(TOKENS_LISTING.ListingModel, { useValue:  Listing });
  container.register(TOKENS_LISTING.ListingRepository, { useClass: ListingRepository });
  container.register(TOKENS_LISTING.CreateListingUseCase, { useClass: CreateListingUseCase });
}