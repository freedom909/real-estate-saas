// //src/subgraphs/auth/services/UiStrategyService.ts

// import { GeminiSecurityService } from "@/security/service/geminiSecurity.service"

// class UiStrategyService {
//   constructor(private geminiService: GeminiSecurityService) {}

//   async generateStrategy(loginContext) {
//     const aiResult = await this.geminiService.analyze(loginContext)

//     return {
//       mode: aiResult.mode || "normal",
//       showSecurityBanner: aiResult.riskScore > 0.5,
//       showOnboarding: loginContext.isFirstLogin
//     }
//   }
// }
