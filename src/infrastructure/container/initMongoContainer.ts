// services/DB/initMongoContainer.js

import { container } from "tsyringe";
import mongoose from "mongoose";
import dns from "dns";

// MongoDB Atlas SRV は DNS 解決が必要。ローカルリゾルバでは querySrv ECONNREFUSED
// になるため public DNS を使う（connectMongoDB.ts と同じ workaround）。
dns.setServers(["8.8.8.8"]);

export async function initMongoContainer() {
  await mongoose.connect(process.env.MONGO_URI!);

  container.register("MongoConnection", {
    useValue: mongoose,
  });

  return container; 
}

export default initMongoContainer;
