// listing.ai.suggestion.repository.ts

import { inject, injectable } from "tsyringe";
import { ModelStatic } from "sequelize";
import { TOKENS_LISTING } from "@/modules/tokens/listing.tokens";

import { ListingAISuggestionMapper } from "../mappers/listingAISuggestionMapper";
import { IListingAISuggestionRepository } from "../../domain/entities/IListingAISuggestionRepository";
import { ListingAISuggestion } from "../../domain/entities/listingAI.suggestion";


@injectable()
export class ListingAISuggestionRepository implements IListingAISuggestionRepository {
    constructor(
        @inject(TOKENS_LISTING.ai.listingAISuggestionModel)
        private model: ModelStatic<any>,
    ) { }

    async findById(id: string): Promise<ListingAISuggestion> {
        if (!id) {
            throw new Error("id is required");
        }
        const suggestion = await this.model.findByPk(id);
        if (!suggestion) {
            throw new Error("suggestion not found");
        }
        return ListingAISuggestionMapper.toDomain(suggestion.toJSON());
    }

    async findByListingId(listingId: string): Promise<ListingAISuggestion[]> {
        const suggestions = await this.model.findAll({ where: { listingId } });
        return suggestions.map(s => ListingAISuggestionMapper.toDomain(s.toJSON()));
    }
    
   async save(suggestion: ListingAISuggestion) {
            const persistenceData = ListingAISuggestionMapper.toPersistence(suggestion);
            await this.model.create(persistenceData);
        }

    }