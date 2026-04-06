import { v4 as uuidv4 } from 'uuid';

export interface ListingProps {
  id?: string;
  title: string;
  description?: string;
  address: string;
  categories: string[];
  amenityIds?: string[];
  tenantId: string;
}

export class Listing {
  private readonly _id: string;
  private props: ListingProps;

  constructor(props: ListingProps) {
    this.validate(props);
    this._id = props.id || uuidv4();
    this.props = {
      ...props,
      id: this._id,
      amenityIds: props.amenityIds || []
    };
  }

  private validate(props: ListingProps) {
    if (!props.title || props.title.trim() === '') {
      throw new Error('title is required');
    }
    if (!props.categories || props.categories.length === 0) {
      throw new Error('must have at least 1 category');
    }
    if (!props.tenantId) {
      throw new Error('tenantId is required');
    }
    if (!props.address) {
      throw new Error('address is required');
    }
  }

  get id(): string { return this._id; }
  get title(): string { return this.props.title; }
  get description(): string | undefined { return this.props.description; }
  get address(): string { return this.props.address; }
  get categories(): string[] { return this.props.categories; }
  get amenityIds(): string[] { return this.props.amenityIds || []; }
  get tenantId(): string { return this.props.tenantId; }

  public toJSON() {
    return { ...this.props, id: this._id };
  }
}