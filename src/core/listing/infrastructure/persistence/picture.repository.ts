// src/core/listing/infrastructure/persistence/picture.repository.ts

import { inject, injectable } from "tsyringe";
import PictureModel from "../models/picture.model";
import { Picture, PictureProps } from "../../domain/entities/picture";
import { TOKENS_PICTURE } from "@/modules/tokens/picture.tokens";
import PictureMapper from "../mappers/picture.mapper";


@injectable()
export class PictureRepository {
    constructor(
        @inject(TOKENS_PICTURE.models.pictureModel)
        private readonly pictureModel: typeof PictureModel,
    ) { }
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
        return new Picture(raw.toJSON());
    }
    async save(picture: Picture) {
        const persistence = PictureMapper.toPersistence(picture);
         const raw = await this.pictureModel.update(persistence, { where: { id: picture.id } });
        const updated = await this.pictureModel.findByPk(picture.id);
        if (!updated) {
            throw new Error("Picture not found");
        }
        return PictureMapper.toDomain(updated);
    }
}
