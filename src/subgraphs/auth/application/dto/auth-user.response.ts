//

// application/dto/auth-user.response.ts

export class AuthUserResponseDTO {
  constructor(
    public readonly id: string,
    public readonly email?: string,
    public readonly name?: string,
    public readonly role?: string,
  ) {}
}