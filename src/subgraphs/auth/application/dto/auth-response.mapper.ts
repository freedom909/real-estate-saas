// application/mappers/auth-response.mapper.ts

import { AuthUserResponseDTO }
  from "../dto/auth-user.response";

export class AuthResponseMapper {

  static toUserDTO(user: any): AuthUserResponseDTO {

    return new AuthUserResponseDTO(
      user.id?.toString?.()
        || user._id?.toString?.(),

      user.email,
      user.name,
      user.role,
    );
  }
}