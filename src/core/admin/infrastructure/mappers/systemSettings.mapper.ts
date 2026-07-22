// src/core/admin/infrastructure/mappers/systemSettings.mapper.ts

import { SystemSettings } from "../../domain/entities/systemSettings";

export class SystemSettingsMapper {
  static toDomain(raw: any): SystemSettings {
    return new SystemSettings({
      id: raw.id,
      key: raw.key,
      value: raw.value,
      category: raw.category,
      description: raw.description,
      updatedBy: raw.updatedBy,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }

  static toPersistence(settings: SystemSettings) {
    return {
      id: settings.id,
      key: settings.key,
      value: settings.value,
      category: settings.category,
      description: settings.description,
      updatedBy: settings.updatedBy,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }
}
