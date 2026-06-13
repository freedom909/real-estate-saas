// FILE: src/subgraphs/amenity/infrastructure/persistence/amenity.repository.ts


import AmenityMapper from '../mappers/amenity.mapper';
import { IAmenityRepository } from '../../domain/entities/IAmenityRepo';
import { Amenity } from "../../domain/entities/amenity";
import AmenityModel from '../models/amenityModel';
import { AmenityCategory } from '../../domain/value-objects/amenityCategory';
  // 🔥 关键：Model → Domain 转换
import { isValidAmenityCategory } from "../../domain/value-objects/amenityCategory";

export class AmenityRepository implements IAmenityRepository {

  async findById(id: string): Promise<Amenity | null> {
    const row = await AmenityModel.findByPk(id);
    if (!row) return null;

    return AmenityMapper.toDomain(row);
  }

  async findManyByIds(ids: string[]): Promise<Amenity[]> {
    const rows = await AmenityModel.findAll({
      where: { id: ids }
    });

    return rows.map(AmenityMapper.toDomain);
  }

  async findAll(): Promise<Amenity[]> {
    const rows = await AmenityModel.findAll();
    return rows.map(row => AmenityMapper.toDomain(row));
  }

  async save(amenity: Amenity){
    await AmenityModel.create(AmenityMapper.toPersistence(amenity));
    return amenity;
  }



static toDomain(raw: AmenityModel): Amenity {
  if (!isValidAmenityCategory(raw.category)) { // プロパティ 'category' は型 'AmenityModel' に存在しません。
    console.warn("Invalid category from DB:", raw.category);

    return new Amenity({
      id: raw.id,
      name: raw.name,
      category: AmenityCategory.UNKNOWN, // fallback
    });
  }

  return new Amenity({
    id: raw.id,
    name: raw.name,
    category: raw.category,
  });
}
}