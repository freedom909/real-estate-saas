// src/modules/container/amenity.register.ts
import { container } from 'tsyringe';
import { TOKENS_AMENITY } from '../tokens/amenity.tokens';
import { AmenityRepository } from '@/subgraphs/amenity/infrastructure/persistence/amenity.repository';
import { CreateAmenityUseCase } from '@/subgraphs/amenity/application/useCase/CreateAmenityUseCase';
import { GetAmenitiesUseCase } from '@/subgraphs/amenity/application/useCase/GetAmenitiesUseCase';
import { GetAmenitiesByIdsUseCase } from '@/subgraphs/amenity/application/useCase/GetAmenitiesByIdsUseCase';

export default function registerAmenityDependencies() {
container.register(TOKENS_AMENITY.AmenityRepository, {
  useClass: AmenityRepository,
});

container.register(TOKENS_AMENITY.CreateAmenityUseCase, {
  useClass: CreateAmenityUseCase,
});

container.register(TOKENS_AMENITY.GetAmenitiesUseCase, {
  useClass: GetAmenitiesUseCase,
});

container.register(TOKENS_AMENITY.GetAmenitiesByIdsUseCase, {
  useClass: GetAmenitiesByIdsUseCase,
});

}
