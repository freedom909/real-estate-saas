//src/subgraphs/listing/domain/entities/listingAISuggestion

export class ListingAISuggestion {
    
  constructor(
    public readonly title: string,
    public readonly description: string,
    public readonly seo: string[],
    public readonly tips: string[]
  ) {}

  static create(data: {
    title: string;
    description: string;
    seo: string[];
    tips: string[];
  }): ListingAISuggestion {
    return new ListingAISuggestion(
      data.title,
      data.description,
      data.seo,
      data.tips,
      
    );
  }


}