// picture.mapper.ts

import { Picture, PictureProps } from "../../domain/entities/picture";

class PictureMapper {
  static toDomain(raw: any): Picture {
    return new Picture({
      id: raw.id,
      listingId: raw.listingId,
      objectKey: raw.objectKey,
      type: raw.type,
      sortOrder: raw.sortOrder,
    });
  }
  static toPersistence(picture: Picture) {
    return picture.toJson();    
  }
}

export default PictureMapper;