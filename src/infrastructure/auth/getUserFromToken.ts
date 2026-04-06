// infrastructure/auth/getUserFromToken.js
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger'; // adjust path if needed

const SECRET_KEY = process.env.JWT_SECRET || 'minshuku_jwt_secret_key_2024_secure_random_string';
// infrastructure/auth/getUserFromToken.ts


async function getUserFromToken(reqOrToken) {
  let token;

  // Auto-extract token if req object is passed
  if (typeof reqOrToken === 'string') {
    token = reqOrToken;
  } else if (reqOrToken?.headers) {
    const authHeader = reqOrToken.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) {
    // Return null for unauthenticated users instead of throwing
    return null;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY, { clockTolerance: 300 });

    if (!decoded.userId || !decoded.email) {
      throw new GraphQLError('Invalid token format', {
        extensions: { code: 'INVALID_TOKEN' }
      });
    }

    logger.info('User extracted from token:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });

    return decoded;

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new GraphQLError('Token has expired', { extensions: { code: 'TOKEN_EXPIRED' } });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new GraphQLError('Invalid token', { extensions: { code: 'INVALID_TOKEN' } });
    }
    throw new GraphQLError('Token verification failed', {
      extensions: { code: 'AUTHENTICATION_ERROR', error: error.message }
    });
  }
}

export default getUserFromToken;
