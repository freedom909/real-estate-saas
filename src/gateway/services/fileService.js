// services/fileService.js
import { Storage } from "@google-cloud/storage";
import { v4 as uuid } from "uuid";

// --- Validate required environment variables ---
if (!process.env.GCP_PROJECT_ID) console.warn("⚠ Missing GCP_PROJECT_ID");
if (!process.env.GCP_CLIENT_EMAIL) console.warn("⚠ Missing GCP_CLIENT_EMAIL");
if (!process.env.GCP_PRIVATE_KEY) console.warn("⚠ Missing GCP_PRIVATE_KEY");
if (!process.env.GCP_BUCKET_NAME) console.warn("⚠ Missing GCP_BUCKET_NAME");

// Safe private key (avoid crash if undefined)
const privateKey = process.env.GCP_PRIVATE_KEY
  ? process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

// Initialize Google Cloud Storage client
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: privateKey,
  },
});

const bucketName = process.env.GCP_BUCKET_NAME;

if (!bucketName) {
  throw new Error("❌ GCP_BUCKET_NAME is missing in environment variables");
}

const gcsBucket = storage.bucket(bucketName);

/**
 * Generate a signed URL (PUT) for uploading a file to GCS
 */
export async function getPresignedUrl({ userId, fileKey, contentType }) {
  if (!userId) throw new Error("userId is required");
  if (!fileKey) throw new Error("fileKey is required");
  if (!contentType) throw new Error("contentType is required");

  // Determine file extension
  const extension = contentType.split("/")[1] ?? "jpg";

  // Final GCS object key
  const key = `mynumber/${userId}/${fileKey}-${uuid()}.${extension}`;

  const file = gcsBucket.file(key);

  // Signed URL expires in 5 minutes
  const expiresAt = Date.now() + 5 * 60 * 1000;

  const [uploadUrl] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: expiresAt,
    contentType,
  });

  return { uploadUrl, key };
}
