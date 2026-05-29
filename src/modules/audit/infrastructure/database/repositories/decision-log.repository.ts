//

import { inject, injectable } from "tsyringe";

import {
    DecisionLogModel
} from "../models/decision-log.model";

import {
    IDecisionLogRepository
} from "../../../domain/repositories/interface/decision-log.repository.interface";

import {
    TOKENS_AUDIT
} from "@/modules/tokens/audit.tokens";

import {
    DecisionLog
} from "@/modules/audit/domain/types/decision-log.type";

@injectable()
export class DecisionLogRepository implements IDecisionLogRepository {

    constructor(
        @inject(
            TOKENS_AUDIT.models.decisionLog
        )
        private readonly model:
            typeof DecisionLogModel
    ) { }

    async find(
        filter: any,
        options?: {
            limit?: number;
            skip?: number;
            sort?: any;
        }
    ): Promise<DecisionLog[]> {

        const {
            limit = 50,
            skip = 0,
            sort = {
                createdAt: -1,
            },
        } = options ?? {};

        const docs =
            await this.model
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec();

        return docs.map(
            this.toDomain
        );
    }

    async count(
        filter: any
    ): Promise<number> {

        return await this.model
            .countDocuments(filter)
            .exec();
    }

    async create(
        data: Partial<DecisionLog>
    ): Promise<DecisionLog> {

        const doc =
            await this.model.create(data);

        return this.toDomain(doc);
    }
    async findById(//
        id: string
    ): Promise<DecisionLog | null> {

        const doc =
            await this.model
                .findById(id)
                .exec();

        if (!doc) {
            return null;
        }

        return this.toDomain(doc);
    }

    private toDomain(
        doc: any
    ): DecisionLog {

        return {
            id:
                doc._id.toString(),

            meta: {
                executionId:
                    doc.meta.executionId,

                correlationId:
                    doc.meta.correlationId,

                requestId:
                    doc.meta.requestId,

                sessionId:
                    doc.meta.sessionId,
            },

            actor: {
                userId:
                    doc.actor.userId?.toString(),

                tenantId:
                    doc.actor.tenantId,

                hostId:
                    doc.actor.hostId,

                role:
                    doc.actor.role,
            },

            input: {
                rawMessage:
                    doc.input.rawMessage,

                source:
                    doc.input.source,

                locale:
                    doc.input.locale,
            },

            decision: {
                status:
                    doc.decision.status,

                approved:
                    doc.decision.approved,

                confidence:
                    doc.decision.confidence,

                reason:
                    doc.decision.reason,

                riskLevel:
                    doc.decision.riskLevel,

                requiresHumanReview:
                    doc.decision
                        .requiresHumanReview,
            },

            createdAt:
                doc.createdAt,
        };
    }
}