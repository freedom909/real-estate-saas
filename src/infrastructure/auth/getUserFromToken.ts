// infrastructure/auth/getUserFromToken.js
import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger'; // adjust path if needed
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getUserFromToken(reqOrToken) {
  const secret = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
  const publicKey = process.env.JWT_PUBLIC_KEY;
  const fallbackSecret = 'minshuku_jwt_secret_key_2024_secure_random_string';
  const keySource = process.env.ACCESS_TOKEN_SECRET ? 'ACCESS_TOKEN_SECRET' : (process.env.JWT_SECRET ? 'JWT_SECRET' : 'fallback');
  const activeSecret = secret || fallbackSecret;
  if (!secret && !publicKey && process.env.NODE_ENV !== 'production') {
    console.warn("[JWT Warning] No secret or public key found in environment variables. Falling back to default string.");
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
    const decodedHeader = jwt.decode(token, { complete: true });
    const alg = decodedHeader?.header?.alg;
    
    let verifyKey: string | Buffer = activeSecret;

    // If the token uses RS256, we MUST use the public key
    if (alg === 'RS256') {
      if (!publicKey) {
        throw new Error("Token uses RS256 but JWT_PUBLIC_KEY is not defined in .env");
      }
      // Handle if publicKey is a path or actual PEM content
      if (publicKey.includes('BEGIN PUBLIC KEY')) {
        verifyKey = publicKey;
      } else {
        // 🔍 Resolve path relative to project root (3 levels up from src/infrastructure/auth)
        const projectRoot = path.resolve(__dirname, "../../../");
        const absoluteKeyPath = path.isAbsolute(publicKey) 
          ? publicKey 
          : path.resolve(projectRoot, publicKey);
        
        if (!fs.existsSync(absoluteKeyPath)) {
          throw new Error(`Public key file not found at: ${absoluteKeyPath}`);
        }
        verifyKey = fs.readFileSync(absoluteKeyPath, 'utf8');
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      const keyDisplay = alg === 'RS256' ? 'Public Key' : 'Symmetric Secret';
      if (verifyKey === fallbackSecret) {
        logger.warn("Verifying signature using hardcoded fallback secret!");
      }
    }

    const decoded = jwt.verify(token, verifyKey, { 
      clockTolerance: 300,
      algorithms: alg === 'RS256' ? ['RS256'] : ['HS256']
    }) as any;

    const userId = decoded.userId || decoded.id || decoded.sub;

    // 🔍 Only enforce the userId as it is mandatory for subsequent logic
    if (!userId) {
      throw new GraphQLError('Invalid token format: missing userId', {
        extensions: { code: 'INVALID_TOKEN', fields: Object.keys(decoded) }
      });
    }

    logger.info('User extracted from token:', {
      userId: userId,
      email: decoded.email || 'not provided',
      role: decoded.role
    });

    return { ...decoded, userId };

  } catch (error) {
    // ✅ 1. If it's already a GraphQLError, re-throw it to preserve the specific message
    if (error instanceof GraphQLError) {
      throw error;
    }

    // ✅ 2. Use error names for more reliable checking
    if (error.name === 'TokenExpiredError') {
      throw new GraphQLError('Token has expired', { extensions: { code: 'TOKEN_EXPIRED' } });
    }
    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      logger.error('JWT Verification Failed:', error.message);
      throw new GraphQLError(`Invalid token: ${error.message}`, { extensions: { code: 'INVALID_TOKEN' } });
    }
    throw new GraphQLError('Token verification failed', {
      extensions: { code: 'AUTHENTICATION_ERROR', error: error.message }
    });
  }
}

export default getUserFromToken;
