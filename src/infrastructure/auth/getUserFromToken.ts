// infrastructure/auth/getUserFromToken.js
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger'; // adjust path if needed


async function getUserFromToken(reqOrToken) {
  // ✅ Evaluate secret inside the function to ensure env vars are loaded
  const secret = 
    process.env.ACCESS_TOKEN_SECRET || 
    process.env.JWT_SECRET || 
    'minshuku_jwt_secret_key_2024_secure_random_string';

  // 🔍 DIAGNOSTIC LOG: Compare this output in BOTH Auth and Booking subgraph consoles
  if (process.env.NODE_ENV !== 'production') {
    const secretPreview = secret.substring(0, 3) + "..." + secret.substring(secret.length - 3);
    console.log(`[JWT Debug] Verifying with secret: ${secretPreview} (Length: ${secret.length})`);
  }

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
    // Peek at the header to check the algorithm without verifying yet
    const unverified = jwt.decode(token, { complete: true });
    if (unverified?.header?.alg === 'RS256') {
      console.warn("[JWT Warning] Token is RS256 but you are verifying with a symmetric secret. This WILL fail.");
    }

    const decoded = jwt.verify(token, secret, { clockTolerance: 300 });

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
      logger.error('JWT Verification Failed:', error.message);
      throw new GraphQLError(`Invalid token: ${error.message}`, { extensions: { code: 'INVALID_TOKEN' } });
    }
    throw new GraphQLError('Token verification failed', {
      extensions: { code: 'AUTHENTICATION_ERROR', error: error.message }
    });
  }
}

export default getUserFromToken;
