// config/keys.ts
import fs from "fs";

export const PRIVATE_KEY = fs.readFileSync(process.env.PRIVATE_PATH!, "utf-8");
export const PUBLIC_KEY = fs.readFileSync(process.env.PUBLIC_PATH!, "utf-8");



