//src/subgraphs/user/domain/entities/profile.ts

export interface Profile {
  id: string;
  userId: string;

  email?: string;
  name?: string;
  avatar?: string;

  phone?: string;
  address?: string;

  createdAt?: Date;
  updatedAt?: Date;
}