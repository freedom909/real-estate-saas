import { container } from "tsyringe";
import { RunBookingAgentUseCase } from "../application/usecases/RunBookingAgentUseCase";

export const bookingResolvers = {
  Mutation: {
    analyzeBookingFraud: async (_: any, { bookingId }: { bookingId: string }) => {
      const useCase = container.resolve(RunBookingAgentUseCase);
      return useCase.execute(bookingId);
    },
  },
};