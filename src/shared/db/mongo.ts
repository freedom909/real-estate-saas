//src/shared/db/mongo.ts
import mongoose, { ConnectOptions } from "mongoose";

export async function connectMongo(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);

  const options: ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
    autoIndex: true
  };

  await mongoose.connect(uri, options);

  console.log("🍃 MongoDB connected");
}

export default mongoose;