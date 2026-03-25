// src/security/repo/securityEvent.repository.ts

import { injectable } from "tsyringe";
import { SecurityEventModel } from "../models/securityEvent.model";

@injectable()
class SecurityEventRepository {
  async save(event: any, assessment: any) {
    return await SecurityEventModel.create({
      ...event,
      assessment,
    });
  }

  async findByUser(userId: string) {
    return SecurityEventModel.find({
      "actor.userId": userId,
    })
      .sort({ createdAt: -1 })
      .limit(50);
  }

  async findHighRiskEvents() {
    return SecurityEventModel.find({
      "assessment.riskScore": { $gte: 0.7 },
    });
  }
}

export default SecurityEventRepository;