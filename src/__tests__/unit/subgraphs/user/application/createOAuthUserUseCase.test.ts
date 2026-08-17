import "reflect-metadata";
import CreateOAuthUserUseCase from "../../../../../subgraphs/user/application/usecase/createOAuthUserUseCase";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockRepo = {
  findByEmail: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  count: jest.fn(),
  deactivate: jest.fn(),
  setUserRole: jest.fn(),
  save: jest.fn(),
  activate: jest.fn(),
};

describe("CreateOAuthUserUseCase", () => {
  let useCase: CreateOAuthUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new (CreateOAuthUserUseCase as any)(mockRepo);
  });

  it("should create OAuth user with correct payload", async () => {
    const input = {
      email: "user@example.com",
      provider: "google",
      profile: {
        name: "Google User",
        avatar: "https://example.com/avatar.jpg",
      },
    };

    mockRepo.findByEmail.mockResolvedValue(null);
    const expectedResult = { id: "new-user", email: "user@example.com" };
    mockRepo.create.mockResolvedValue(expectedResult);

    const result = await useCase.execute(input);

    expect(mockRepo.findByEmail).toHaveBeenCalledWith("user@example.com");
    expect(mockRepo.create).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "Google User",
      role: "CUSTOMER",
      picture: "https://example.com/avatar.jpg",
    });
    expect(result).toEqual(expectedResult);
  });

  it("should return existing user if email already exists (idempotent)", async () => {
    const existingUser = { id: "existing-user", email: "user@example.com" };
    mockRepo.findByEmail.mockResolvedValue(existingUser);

    const result = await useCase.execute({
      email: "user@example.com",
      provider: "google",
      profile: { name: "Google User" },
    });

    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(result).toEqual(existingUser);
  });

  it("should use empty string when avatar is not provided", async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: "new-user" });

    await useCase.execute({
      email: "user@example.com",
      provider: "github",
      profile: { name: "GitHub User" },
    });

    expect(mockRepo.create).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "GitHub User",
      role: "CUSTOMER",
      picture: "",
    });
  });

  it("should propagate repository errors", async () => {
    mockRepo.findByEmail.mockRejectedValue(new Error("Database error"));

    await expect(
      useCase.execute({
        email: "user@example.com",
        provider: "google",
        profile: { name: "User" },
      })
    ).rejects.toThrow("Database error");
  });
});
