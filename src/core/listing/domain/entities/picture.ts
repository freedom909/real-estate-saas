// src/core/listing/domain/entities/picture.ts

import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";
import { inject, injectable } from "tsyringe";
import { PictureModel } from "../../infrastructure/models/picture.model";

export interface PictureProps {
  id: string;
  listingId: string;
  objectKey: string;
  url: string;
  mimeType: string;
  size: number;
  type: string;
  sortOrder: number;
}

@injectable()
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

  get url() {
    return this.props.url;
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