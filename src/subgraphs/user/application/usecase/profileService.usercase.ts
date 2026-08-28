// profileService.usercase.ts
import { TOKENS_USER } from "@/modules/tokens/user.tokens";
import { IProfileRepository } from "../../domain/repository/IProfileRepository";

import { inject, injectable } from "tsyringe";

@injectable()
export class ProfileServiceUseCase {
  constructor(
    @inject(TOKENS_USER.repos.profileRepository)
    private readonly profileRepository: IProfileRepository,
  ) {}

  async findByUserId(userId: string) {
    return this.profileRepository.findByUserId(userId);
  }
}