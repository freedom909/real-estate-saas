//src/subgraphs/host/services/membership.repo.service.ts

import { inject, injectable } from "tsyringe";
import { MembershipRepository } from "../repos/membership.repo";
import { TOKENS_Host } from "@/modules/tokens/host.tokens";

@injectable()
export class MembershipRepoService {
  constructor(
    @inject(TOKENS_Host.repos.membershipRepo) private repo: MembershipRepository
  ) {}
}

export default MembershipRepoService;
