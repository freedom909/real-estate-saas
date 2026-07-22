// src/core/admin/application/usecase/getSystemSettings.usecase.ts

import { injectable, inject } from "tsyringe";
import { ISystemSettingsRepository } from "../../domain/entities/ISystemSettingsRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

@injectable()
export default class GetSystemSettingsUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.systemSettingsRepository)
    private settingsRepo: ISystemSettingsRepository
  ) {}

  async execute(category?: string) {
    const settings = category
      ? await this.settingsRepo.findByCategory(category)
      : await this.settingsRepo.findAll();

    return settings.map((s) => ({
      id: s.id,
      key: s.key,
      value: s.value,
      category: s.category,
      description: s.description,
      updatedBy: s.updatedBy,
      updatedAt: s.updatedAt,
      createdAt: s.createdAt,
    }));
  }
}
