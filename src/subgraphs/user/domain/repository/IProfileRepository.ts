import { Profile } from "../entities/profile";

// IProfileRepository.ts
export interface IProfileRepository {
  findByUserId(userId: string): Promise<Profile | null>;// Cannot find name 'Profile'.
}

