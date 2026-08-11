// src/core/listing/domain/entities/picture.ts

export interface PictureProps {
  id: string;
  listingId: string;
  objectKey: string;
  mimeType: string;
  size: number;
  type: string;
  sortOrder: number;
}

export class Picture {
    toJson() {
        return this.props;
    }
   constructor(private readonly props: PictureProps) {}

  get id() {
    return this.props.id;
  }

  get listingId() {
    return this.props.listingId;
  }


  get mimeType(){
    return this.props.mimeType
  }

  get objectKey() {
    return this.props.objectKey;
  }

  get type() {
    return this.props.type;
  }

  get sortOrder() {
    return this.props.sortOrder;
  }
}