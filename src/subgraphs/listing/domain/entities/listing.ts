// src/subgraphs/listing/domain/entities/Listing.ts

import { Title } from "../value-objects/Title";
import { Description } from "../value-objects/Description";

export interface ListingProps {
  id: string;
  hostId: string;
  title: Title;
  description: Description;
  locationId: string; // ✅ 替代 address

  categories: string[];
  amenityIds: string[];
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
  get title() { return this.props.title.getValue(); }
  get description() { return this.props.description.getValue(); }
  get locationId() { return this.props.locationId; }
  get categories() { return this.props.categories; }
  get amenityIds() { return this.props.amenityIds; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  // ======================
  // Business Logic
  // ======================

  updateTitle(title: string) {
    this.props.title = new Title(title);
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
    if (!props.locationId) throw new Error("locationId required");// "message": "locationId required",
    if (!props.categories.length) throw new Error("categories required");
  }
}