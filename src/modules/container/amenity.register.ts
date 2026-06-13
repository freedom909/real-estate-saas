// src/modules/container/amenity.register.ts
import { container } from 'tsyringe';
import { TOKENS_AMENITY } from '../tokens/amenity.tokens';
import { AmenityRepository } from '@/core/amenity/infrastructure/persistence/amenity.repository';
import { CreateAmenityUseCase } from '@/core/amenity/application/useCase/createAmenityUseCase';
import { GetAmenitiesUseCase } from '@/core/amenity/application/useCase/getAmenitiesUseCase';


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
  useClass: GetAmenitiesUseCase,
});

}
