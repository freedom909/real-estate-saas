// services/DB/initMongoContainer.js

import { container } from "tsyringe";
import mongoose from "mongoose";

export async function initMongoContainer() {
  await mongoose.connect(process.env.MONGO_URI!);

  container.register("MongoConnection", {
    useValue: mongoose,
  });

  return container; 
}

export default initMongoContainer;
