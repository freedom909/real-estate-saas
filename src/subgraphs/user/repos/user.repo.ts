// src/subgraphs/user/repos/user.repo.ts
import { Document, HydratedDocument, Model, Types } from "mongoose";
import UserModel, { IUserDB } from "../models/user.model.js";
import { inject, injectable } from "tsyringe";
import { TOKENS_USER } from "@/modules/tokens/user.tokens.js";
import { TOKENS_INFRA } from "@/modules/tokens/infra.tokens.js";

export interface IUserDBObject {

 _id:string;

 email:string;

 name:string;

 avatar:string;

 role:string;

 status:string;

 tokenVersion:number;

 createdAt:Date;

 updatedAt:Date;

}
export interface IUserRepo {
  findById(id: string): Promise<IUserDBObject | null>;
  userByEmail(email: string): Promise<IUserDBObject | null>;
  create(user: Partial<IUserDBObject>): Promise<IUserDBObject>;
  update(id: string, user: Partial<IUserDBObject>): Promise<IUserDBObject | null>;
  deactivate(id: string): Promise<void>;
}
@injectable()
export default class UserRepo implements IUserRepo {
  constructor(
    @inject(TOKENS_USER.models.user)
    private UserModel: Model<IUserDBObject>,
    @inject(TOKENS_INFRA.infra.redis)
    private redis: any
  ) {
    // this.UserModel = UserModel;
  }

userByEmail(email: string) {
  console.log("repo userByEmail", email);
  const user=this.UserModel.findOne({ email }).lean<IUserDBObject>();
  // console.log("repo userByEmail++", user);
  return user;
}

findById(id: string) {
  return this.UserModel.findById(id).lean<IUserDBObject>();
}

async create(data: Partial<IUserDBObject>) {
  const created = await this.UserModel.create(data);
  return created;
}

  async deactivate(id: string): Promise<void> {
     await this.UserModel.findByIdAndUpdate(id, { status: "INACTIVE" });
  }

async update(id: string, user: Partial<IUserDBObject>): Promise<IUserDBObject | null> {
  return this.UserModel.findByIdAndUpdate(id, user, { new: true }).lean<IUserDBObject>();
}

async updateLastLogin(userId: string, lastLoginAt: Date) {

  return this.UserModel.updateOne(
    { _id: userId },
    { lastLoginAt: new Date() }
  );
}
}