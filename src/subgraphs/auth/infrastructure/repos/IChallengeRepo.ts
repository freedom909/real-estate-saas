import Challenge from "../../domain/entities/challenge.entity";


export interface IChallengeRepo {
  create(data: Partial<Challenge>): Promise<Challenge>;
  findById(id: string): Promise<Challenge | null>;
  markVerified(id: string): Promise<void>;
}