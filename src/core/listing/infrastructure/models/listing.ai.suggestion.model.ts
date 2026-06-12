// listing.ai.suggestion.model.ts

import { DataTypes } from "sequelize";
import { sequelize } from "@/infrastructure/config/seq";
import { SuggestionStatus } from "../../domain/entities/suggestionStatus";

 const ListingAISuggestionModel =
  sequelize.define(
    "ListingAISuggestion",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },

      listingId: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      prompt: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      suggestion: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      model: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(SuggestionStatus)),
        allowNull: false,
        defaultValue: SuggestionStatus.PENDING,
      },
    },
    {
      tableName: "listing_ai_suggestions",
      timestamps: true,
    },
    
  );

export default ListingAISuggestionModel;