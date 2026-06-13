import { container } from "tsyringe";
import { RunBookingAgentUseCase } from "./application/usecases/runBookingAgent.usecase";


export const bookingResolvers = {
  Mutation: {
    analyzeBookingFraud: async (_: any, { bookingId }: { bookingId: string }) => {
      const useCase = container.resolve<RunBookingAgentUseCase>(RunBookingAgentUseCase);
      return useCase.execute(bookingId);
    },
  },
};