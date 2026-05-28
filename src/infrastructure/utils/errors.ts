import { GraphQLError } from 'graphql';

class AuthenticationError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHENTICATED',
      },
    });
  }
}

class ForbiddenError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'FORBIDDEN',
      },
    });
  }
}

class UserInputError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'USER_INPUT_ERROR',
      },
    });
  }
}

class UnauthorizedError extends GraphQLError {
  constructor(message: string) {
    super(message, {
      extensions: {
        code: 'UNAUTHORIZED',
      },
    });
  }
}

export { AuthenticationError, ForbiddenError,UserInputError,UnauthorizedError };
