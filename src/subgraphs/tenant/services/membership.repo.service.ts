//src/subgraphs/tenant/services/membership.repo.service.ts

import { inject, injectable } from "tsyringe";
import { MembershipRepository } from "../repos/membership.repo";
import { TOKENS_TENANT } from "@/modules/tokens/tenant.tokens";

@injectable()
export class MembershipRepoService {
  constructor(
    @inject(TOKENS_TENANT.repos.membershipRepo) private repo: MembershipRepository
  ) {}
}

export default MembershipRepoService;
