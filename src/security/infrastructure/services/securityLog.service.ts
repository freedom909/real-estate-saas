import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { inject, injectable } from "tsyringe";
import { SecurityLogRepository } from "../repos/securityLog.repository";

//
@injectable()
export class SecurityLogService {

  constructor(
    @inject(
      TOKENS_AUDIT.repos.securityLog
    )
    private readonly repository:
      SecurityLogRepository
  ) {}
}