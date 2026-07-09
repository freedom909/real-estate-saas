// src/subgraphs/listing/domain/entities/Listing.ts

import { Description } from "../value-objects/description";
import { Title } from "../value-objects/Title";

import { SuggestionStatus } from "./suggestionStatus";

export interface ListingProps {
  id: string;
  rawTitle?: string;
  rawDescription?: string;

  hostId: string;
  locationId: string;

  title: Title;
  description: Description;

  address: string;

  categories: string[];
  amenityIds: string[];

  numOfBeds: number;
  numOfCustomers: number;
  numOfBathrooms: number;
  numOfRooms: number;

  price: number;

  picture: string[];

  isFeatured: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export class Listing {
  private props: ListingProps;

  constructor(props: ListingProps) {
    this.validate(props);
    this.props = props;
  }

  // getters
  get id() { return this.props.id; }
  get hostId() { return this.props.hostId; }
get title(): string {
  return this.props.title.getValue();
}

get description(): string {
  return this.props.description.getValue();
}
  get locationId() { return this.props.locationId; }
  get categories() { return this.props.categories; }
  get amenityIds() { return this.props.amenityIds; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
  get address() { return this.props.address; }
  get numOfBeds() { return this.props.numOfBeds; }
  get numOfCustomers() { return this.props.numOfCustomers; }
  get numOfBathrooms() { return this.props.numOfBathrooms; }
  get numOfRooms() { return this.props.numOfRooms; }
  get price() { return this.props.price; }
  get picture() { return this.props.picture; }
  get isFeatured() { return this.props.isFeatured; }
  get rawTitle() { return this.props.rawTitle; }
  get rawDescription() { return this.props.rawDescription;
  
  }
  // ======================
  // Business Logic
  // ======================

  updateTitle(title: string) {
    this.props.title = new Title(title);
    this.touch();
  }
  updateAddress(address: string) {
    this.props.address = address;
    this.touch();
  }

  updateDescription(desc: string) {
    this.props.description = new Description(desc);
    this.touch();
  }

  // 🔥 AI行为（核心）
  generateTitlePrompt() {
    return this.props.title.buildAIPrompt({
      description: this.description,
    });
  }

  generateDescriptionPrompt() {
    return this.props.description.buildAIPrompt({
      title: this.title,
    });
  }

  applySuggestedTitle(title: string) {
    this.updateTitle(title);
  }

  applySuggestedDescription(desc: string) {
    this.updateDescription(desc);
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  private validate(props: ListingProps) {
    if (!props.hostId) throw new Error("hostId required");
    if (!props.locationId) throw new Error("locationId required");
    // categories may be empty when loaded from DB (join table may have no rows)
  }
}