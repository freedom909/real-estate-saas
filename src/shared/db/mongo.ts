//src/shared/db/mongo.ts
import mongoose, { ConnectOptions } from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectMongo(uri: string): Promise<void> {
  mongoose.set("strictQuery", true);

  const options: ConnectOptions = {
    serverSelectionTimeoutMS: 10000,
    autoIndex: true
  };

  await mongoose.connect(uri, options);

  console.log("MongoDB connected");
  console.log("MongoDB database =", mongoose.connection.name);
}

export default mongoose;