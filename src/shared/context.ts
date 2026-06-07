import { DependencyContainer } from "tsyringe";

export interface GraphQLContext {
  user?: {
    id: string;
    role: string;
  };
  container: DependencyContainer;
}