// src/core/listing/infrastructure/persistence/picture.repository.ts

import { inject, injectable } from "tsyringe";
import { PictureModel } from "../models/picture.model";
import { Picture, PictureProps } from "../../domain/entities/picture";
import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";
import PictureMapper from "../mappers/picture.mapper";
import { IPictureRepository } from "../../domain/repositories/picture.repository";



@injectable()
export class PictureRepository implements IPictureRepository{
    constructor(
        @inject(TOKENS_PICTURE.models.pictureModel)
        private readonly pictureModel: typeof PictureModel,
    ) {}
    async findByListingId(listingId: string): Promise<Picture[]> {
        const raws = await this.pictureModel.findAll({
            where: {
                listingId,
            },
        });
        return raws.map((raw) => PictureMapper.toDomain(raw));
    }
    async delete(id: string): Promise<void> {
        const deleted = await this.pictureModel.destroy({
            where: {
                id,
            },
        });
        if (deleted === 0) {
      throw new Error(
        "Picture not found"
      );
    }
    }
    async create(picture: Picture) {
        const persistence = PictureMapper.toPersistence(picture);
        const raw = await this.pictureModel.create(persistence);//
        return PictureMapper.toDomain(raw);
    }
    async findById(id: string): Promise<Picture | null> {
        const raw = await this.pictureModel.findByPk(id);
        if (!raw) {
            return null;
        }
        return PictureMapper.toDomain(raw);
    }
    async save(picture: Picture) {
        const persistence = PictureMapper.toPersistence(picture);
        const [affectedRows] = await this.pictureModel.update(
        persistence,
        {
            where: {
                id: picture.id,
            },
        }
    );
        if (affectedRows === 0) {
            throw new Error("Picture not found");
        }
        const updated = await this.pictureModel.findByPk(picture.id);
        if (!updated) {
            throw new Error("Picture not found");
        }
        return PictureMapper.toDomain(updated);
    }
}
