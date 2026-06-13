import { container } from "tsyringe";
import { RunPaymentAgentUseCase } from "../application/usecases/RunPaymentAgentUseCase";
import { TOKENS_AI } from "@/modules/tokens/ai.tokens";

export const paymentResolvers = {
  Mutation: {
    analyzePaymentRisk: async (_: any, { transactionId }: { transactionId: string }) => {
      const useCase = container.resolve<RunPaymentAgentUseCase>(TOKENS_AI.usecase.runPaymentAgentUseCase);
      return useCase.execute(transactionId);
    },
  },
};