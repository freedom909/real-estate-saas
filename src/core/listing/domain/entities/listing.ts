// src/core/listing/domain/entities/listing.ts

import { Description } from "../value-objects/description";
import { ListingStatus } from "../value-objects/listing.status";
import { Title } from "../value-objects/Title";
import { Picture } from "./picture";

export interface ListingProps {
  id: string;
  status?: ListingStatus;
  
  title: Title;
  description: Description;

  rawTitle?: string;
  rawDescription?: string;
  tenantId: string;
  ownerId: string;
  locationId: string;

  categoryIds: string[];
  amenityIds: string[];

  numOfBeds: number;
  numOfCustomers: number;
  numOfBathrooms: number;
  numOfRooms: number;

  pricePerNight: number;
  
  pictures: Picture[];

  isFeatured: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export class Listing {
  private props: ListingProps;
  private _status: ListingStatus;
  constructor(props: ListingProps) {
    this.validate(props);
    this.props = props;
    this._status = props.status ?? ListingStatus.DRAFT;
  }

 
  // OWNER publishes a listing directly
  publish(): void {
    if (
      this._status !== ListingStatus.DRAFT &&
      this._status !== ListingStatus.UNPUBLISHED
    ) {
      throw new Error(
        "Only draft or unpublished listings can be published"
      );
    }

    this._status = ListingStatus.PUBLISHED;
    this.touch();
  }

  // OWNER temporarily removes a published listing
  unpublish(): void {
    if (this._status !== ListingStatus.PUBLISHED) {
      throw new Error(
        "Only published listings can be unpublished"
      );
    }

    this._status = ListingStatus.UNPUBLISHED;
    this.touch();
  }

  // Platform ADMIN / SUPER_ADMIN suspends a listing
  suspend(): void {
    if (
      this._status !== ListingStatus.DRAFT &&
      this._status !== ListingStatus.PUBLISHED &&
      this._status !== ListingStatus.UNPUBLISHED &&
      this._status !== ListingStatus.PENDING_REVIEW
    ) {
      throw new Error(
        "Listing cannot be suspended from its current status"
      );
    }

    this._status = ListingStatus.SUSPENDED;
    this.touch();
  }

  // Platform ADMIN / SUPER_ADMIN restores a suspended listing
  // This method will be used only after we define a separate
  // authorization action and restoration workflow.
  restore(): void {
    if (this._status !== ListingStatus.SUSPENDED) {
      throw new Error(
        "Only suspended listings can be restored"
      );
    }

    this._status = ListingStatus.UNPUBLISHED;
    this.touch();
  }

  // ======================
  // Getters
  // ======================
  get status() {
    return this._status;
  }
  get isBookable() {
    return this._status === ListingStatus.PUBLISHED;
  }

  get id() {
    return this.props.id;
  }

  get title(): string {
    return this.props.title.getValue();
  }

  get description(): string {
    return this.props.description.getValue();
  }

  get rawTitle() {
    return this.props.rawTitle;
  }

  get rawDescription() {
    return this.props.rawDescription;
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get ownerId() {
    return this.props.ownerId;
  }

  get locationId() {
    return this.props.locationId;
  }

  get categoryIds() {
    return this.props.categoryIds;
  }

  get amenityIds() {
    return this.props.amenityIds;
  }

  get numOfBeds() {
    return this.props.numOfBeds;
  }

  get numOfCustomers() {
    return this.props.numOfCustomers;
  }

  get numOfBathrooms() {
    return this.props.numOfBathrooms;
  }

  get numOfRooms() {
    return this.props.numOfRooms;
  }

  get pricePerNight() {
    return this.props.pricePerNight;
  }

  get pictures() {
    return this.props.pictures;
  }

  get isFeatured() {
    return this.props.isFeatured;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

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
    if (!props.id) {
      throw new Error("id required");
    }

    if (!props.tenantId) {
      throw new Error("tenantId required");
    }

    if (!props.ownerId) {
      throw new Error("ownerId required");
    }

    if (!props.locationId) {
      throw new Error("locationId required");
    }

    if (props.pricePerNight < 0) {
      throw new Error("pricePerNight cannot be negative");
    }

    
  }

  
}