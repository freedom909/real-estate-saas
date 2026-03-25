import { DependencyContainer } from "tsyringe";
import { GeminiSecurityService } from "../service/geminiSecurity.service";
import  SecurityEventRepository  from "../repos/securityEvent.repo";
import { TOKENS_SECURITY } from "./security.tokens";


export function registerSecurityDependencies(container: DependencyContainer) {
  container.register(TOKENS_SECURITY.services.geminiSecurityService, {
    useClass: GeminiSecurityService,
  });

container.register(TOKENS_SECURITY.services.uiStrategyService, {
    useFactory: (c) =>
        c.resolve(TOKENS_SECURITY.services.geminiSecurityService),
  })

  container.register(TOKENS_SECURITY.repos.securityEventRepository, {
    useClass: SecurityEventRepository,
  });
}