// Test.model.ts
import mongoose from "mongoose";
import {IdentityModel} from "./models/identity.model";
import {MembershipModel} from "../auth/models/member.ship.model";

async function testModels() {
  await mongoose.connect("mongodb://localhost:27017/saas");

  const identity = await IdentityModel.create({
    value: "test@example.com",
    userId: new mongoose.Types.ObjectId(),
    type: "EMAIL",
    isPrimary: true,
  } as any);

  console.log("Identity created:", identity);

  const membership = await MembershipModel.create({
    hostId: new mongoose.Types.ObjectId(),
    userId: (identity as any)?._id || new mongoose.Types.ObjectId(),
    role: "MEMBER",
  });

  console.log("Membership created:", membership);

  await mongoose.disconnect();
}

testModels();