// src/core/admin/application/usecase/deleteSystemSetting.usecase.ts

import { injectable, inject } from "tsyringe";
import { ISystemSettingsRepository } from "../../domain/entities/ISystemSettingsRepository";
import { TOKENS_ADMIN } from "@/modules/tokens/admin.tokens";

@injectable()
export default class DeleteSystemSettingUseCase {
  constructor(
    @inject(TOKENS_ADMIN.repos.systemSettingsRepository)
    private settingsRepo: ISystemSettingsRepository
  ) {}

  async execute(key: string): Promise<boolean> {
    return this.settingsRepo.delete(key);
  }
}
