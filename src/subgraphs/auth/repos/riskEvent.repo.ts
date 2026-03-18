import { injectable, inject } from "tsyringe"
import mongoose, { Model } from "mongoose"


import  {  RiskEventModel } from "../models/riskEvent.model"

import RiskEventEntity from "../domain/risk.event"
import { hash } from "../../../infrastructure/utils/hash"

export class RiskEventRepo {

  constructor(
    private model: Model<RiskEventModel>
  ) {}

  async create(data: Partial<RiskEventModel>) {

    const doc = await this.model.create({

      userId: new mongoose.Types.ObjectId(data.userId),

      eventType: data.eventData?.type,

      eventData: data.eventData?.data,

      ip: hash(data.ip as string) ,

      userAgent: hash(data.userAgent as string),

      deviceId: data.deviceId

    })

    return this.toEntity(doc)

  }

 toEntity(doc: any): RiskEventEntity {

  return {
  id: doc._id.toString(),

  userId: doc.userId.toString(),

  type: doc.eventType, // ← 这里改成 type

  eventData: doc.eventData,

  ip: doc.ip,

  userAgent: doc.userAgent,

  deviceId: doc.deviceId,

  createdAt: doc.createdAt,

  updatedAt: doc.updatedAt,
 
  Type: "",

}

}
}