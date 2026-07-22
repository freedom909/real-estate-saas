// src/core/admin/application/usecase/updateSystemSetting.usecase.ts

import { injectable, inject } from "tsyringe";
import { ISystemSettingsRepository } from "../../domain/entities/ISystemSettingsRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

export interface UpdateSystemSettingInput {
  key: string;
  value: string;
  category?: string;
  description?: string;
  updatedBy?: string;
}

@injectable()
export default class UpdateSystemSettingUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.systemSettingsRepository)
    private settingsRepo: ISystemSettingsRepository
  ) {}

  async execute(input: UpdateSystemSettingInput) {
    const setting = await this.settingsRepo.upsert(
      input.key,
      input.value,
      input.category || "general",
      input.description,
      input.updatedBy
    );

    return {
      id: setting.id,
      key: setting.key,
      value: setting.value,
      category: setting.category,
      description: setting.description,
      updatedBy: setting.updatedBy,
      updatedAt: setting.updatedAt,
      createdAt: setting.createdAt,
    };
  }
}
