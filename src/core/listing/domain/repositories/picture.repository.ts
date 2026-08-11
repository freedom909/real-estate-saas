import { Picture } from "../entities/picture";

export interface IPictureRepository {

  create( picture: Picture ): Promise<Picture>;

  findById(id: string): Promise<Picture | null>;

  findByListingId(listingId: string): Promise<Picture[]>;
  save(picture: Picture): Promise<Picture>;

  delete(id: string): Promise<void>;
}