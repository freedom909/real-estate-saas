// listing.ai.suggestion.repository.ts

import { inject, injectable } from "tsyringe";
import { ModelStatic } from "sequelize";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";
import ListingAISuggestionModel from "@/subgraphs/listing/infrastructure/models/listing.ai.suggestion.model";
import { ListingAISuggestion } from "../../domain/entities/listingAISuggestion";
import { ListingAISuggestionMapper } from "../mappers/listingAISuggestionMapper";
import { IListingAISuggestionRepository } from "../../domain/repos/IListingAISuggestionRepository";


@injectable()
export class ListingAISuggestionRepository implements IListingAISuggestionRepository {
    constructor(
        @inject(TOKENS_AI.ListingAISuggestionModel)
        private model: ModelStatic<any>,
    ) { }
    async findById(id: string): Promise<ListingAISuggestion> {
        if (!id) {
            throw new Error("id is required");
        }
        const suggestion = await this.model.findByPk(id);// 
        if (!suggestion) {
            throw new Error("suggestion not found");
        }
        return ListingAISuggestionMapper.toDomain(suggestion);
    }

    async findByListingId(listingId: string): Promise<ListingAISuggestion[]> {
        throw new Error("Method not implemented.");
    }
    
   async save(suggestion: ListingAISuggestion) {
            const persistenceData = ListingAISuggestionMapper.toPersistence(suggestion);
            await this.model.create(persistenceData);
        }

    }