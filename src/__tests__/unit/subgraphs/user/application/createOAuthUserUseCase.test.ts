import "reflect-metadata";
import CreateOAuthUserUseCase from "../../../../../subgraphs/user/application/usecase/createOAuthUserUseCase";
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

type MockRepo = {
  createOAuthUser: jest.Mock<any>;
};

describe("CreateOAuthUserUseCase", () => {
  let useCase: CreateOAuthUserUseCase;
  let mockRepo: MockRepo;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo = {
      createOAuthUser: jest.fn(),
    };
    useCase = new CreateOAuthUserUseCase(mockRepo as any);
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

    const expectedResult = { id: "new-user", email: "user@example.com" };
    mockRepo.createOAuthUser.mockResolvedValue(expectedResult);

    const result = await useCase.execute(input);

    expect(mockRepo.createOAuthUser).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "Google User",
      picture: "https://example.com/avatar.jpg",
      provider: "google",
    });
    expect(result).toEqual(expectedResult);
  });

  it("should use empty string when avatar is not provided", async () => {
    const input = {
      email: "user@example.com",
      provider: "github",
      profile: {
        name: "GitHub User",
      },
    };

    mockRepo.createOAuthUser.mockResolvedValue({ id: "new-user" });

    await useCase.execute(input);

    expect(mockRepo.createOAuthUser).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "GitHub User",
      picture: "",
      provider: "github",
    });
  });

  it("should propagate repository errors", async () => {
    const input = {
      email: "user@example.com",
      provider: "google",
      profile: { name: "User" },
    };

    const error = new Error("Database error");
    mockRepo.createOAuthUser.mockRejectedValue(error);

    await expect(useCase.execute(input)).rejects.toThrow("Database error");
  });

  it("should pass through empty profile fields", async () => {
    const input = {
      email: "user@example.com",
      provider: "facebook",
      profile: {
        name: "",
        avatar: undefined,
      },
    };

    mockRepo.createOAuthUser.mockResolvedValue({ id: "new-user" });

    await useCase.execute(input);

    expect(mockRepo.createOAuthUser).toHaveBeenCalledWith({
      email: "user@example.com",
      name: "",
      picture: "",
      provider: "facebook",
    });
  });
});
