//src/infrastructure/auth/verifyJwt.ts
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Robustly load .env from root to ensure keys are available across all subgraphs
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

interface JwtPayload {
  [key: string]: any;
}

const getVerifyKey = () => {
  const key = process.env.JWT_PUBLIC_KEY || process.env.ACCESS_TOKEN_SECRET!;
  if (!key) return null;

  if (key.includes('BEGIN PUBLIC KEY')) {
    return key;
  }

  // If the environment variable contains a file path, read the content
  if (key.includes('.pem') || key.includes('/') || key.includes('\\')) {
    const projectRoot = path.resolve(__dirname, "../../../");
    const absolutePath = path.isAbsolute(key) ? key : path.resolve(projectRoot, key);
    return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : null;
  }

  return key;
};

function verifyJwt(token: string): JwtPayload {
  const verifyKey = getVerifyKey();
  if (!verifyKey) {
    throw new Error("secretOrPrivateKey must have a value: JWT_PUBLIC_KEY or ACCESS_TOKEN_SECRET is missing from .env");
  }

  return jwt.verify(
    token,
    verifyKey,
    {
      algorithms: ["HS256"],   
    }
  ) as JwtPayload;
}

export default verifyJwt;