// src/wisdom/orchestration/reference.stage.ts

import { inject, injectable } from "tsyringe";
import { WISDOM_TOKENS } from "../../container/tokens/wisdom.tokens";
import { IReferenceResolver } from "../../contracts/Ilisting-reference.resolver";
import { IPipelineStage } from "./i-pipeline-stage";
import { WisdomPipelineContext } from "../wisdomPipeline.context";
import { getCachedSearchResults } from "../../memory/search-results-cache";
import { EntityType } from "../../shared/enums/entity-type.enum";

@injectable()
export class ReferenceStage implements IPipelineStage {
  constructor(
    @inject(WISDOM_TOKENS.referenceResolver)
    private resolver: IReferenceResolver,
  ) {}

  async execute(ctx: WisdomPipelineContext) {
    if (!ctx.semantic) return ctx;

    // Populate context.resources from semantic entities
    // This ensures search parameters (location, dates, etc.) are available
    // for auto-search in ListingReferenceResolver
    this.populateResourcesFromSemantic(ctx);

    // Reload search results from global cache
    const cached = getCachedSearchResults(ctx.memoryContext.sessionId);
    if (cached.length > 0 && (!ctx.request.context.resources.searchResults || ctx.request.context.resources.searchResults.length === 0)) {
      ctx.request.context.resources.searchResults = cached;
    }

    ctx.resolvedSemantic = await this.resolver.resolve(
      ctx.semantic,
      ctx.request.context
    );

    return ctx;
  }

  private populateResourcesFromSemantic(ctx: WisdomPipelineContext): void {
    const resources = ctx.request.context.resources;
    const entities = ctx.semantic.entities;

    // Location
    if (!resources.location) {
      const locationEntity = entities.find(e => e.type === EntityType.LOCATION);
      if (locationEntity) {
        resources.location = locationEntity.value as string;
      }
    }

    // Check-in date
    if (!resources.checkIn) {
      const checkInEntity = entities.find(
        e => e.type === EntityType.CHECK_IN || e.type === EntityType.CHECK_IN_DATE
      );
      if (checkInEntity) {
        resources.checkIn = checkInEntity.value as string;
      }
    }

    // Check-out date
    if (!resources.checkOut) {
      const checkOutEntity = entities.find(
        e => e.type === EntityType.CHECK_OUT || e.type === EntityType.CHECK_OUT_DATE
      );
      if (checkOutEntity) {
        resources.checkOut = checkOutEntity.value as string;
      }
    }

    // Customer count
    if (!resources.customerCount) {
      const customerEntity = entities.find(e => e.type === EntityType.CUSTOMER_COUNT);
      if (customerEntity) {
        resources.customerCount = parseInt(customerEntity.value as string, 10) || 1;
      }
    }
  }
}
