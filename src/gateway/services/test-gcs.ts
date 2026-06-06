// test-gcs.js
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n")
  }
});

async function test() {
  try {
    const bucket = storage.bucket(process.env.GCP_BUCKET_NAME);
    const [exists] = await bucket.exists();

    console.log("Bucket exists:", exists);
  } catch (e) {
    console.error("GCS ERROR:", e);
  }
}

test();
