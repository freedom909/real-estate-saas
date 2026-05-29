import { TOKENS_AUDIT } from "@/modules/tokens/audit.tokens";
import { inject, injectable } from "tsyringe";
import { SecurityLogModel } from "../models/securityLog.model";

//
@injectable()
export class SecurityLogRepository {

  constructor(
    @inject(
      TOKENS_AUDIT.models.securityLog
    )
    private readonly model:
      typeof SecurityLogModel
  ) {}
}