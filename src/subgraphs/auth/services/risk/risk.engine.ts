import { injectable } from "tsyringe";
import { RiskEventRepo } from "../../repos/risk.event.repo";
import SessionRepository from "../../repos/session.repo";
import { RiskEventType } from "../../models/risk.event.model";
import mongoose from "mongoose";

@injectable()
export default class RiskEngine {

    constructor(
        private riskEventRepo: RiskEventRepo,
        private sessionRepo: SessionRepository
    ) { }

    async evaluate(context: {
        userId: string;
        ip?: string;
        userAgent?: string;
        deviceId?: string;
        sessionId?: string;
        type: RiskEventType;
        metadata?: any;
    }) {
        let score = 0;
        const triggers: string[] = [];

        // 1️⃣ 规则执行
        const rules = [
            this.checkNewDevice,
            this.checkIpChange,
            this.checkSuspiciousIP,
        ];

        for (const rule of rules) {
            const result = await rule.call(this, context);

            if (result.triggered) {
                score += result.score;
                triggers.push(result.reason);
            }
        }

        // 2️⃣ 计算 severity
        const severity =
            score >= 80 ? "HIGH" :
                score >= 40 ? "MEDIUM" :
                    "LOW";

        // 3️⃣ 记录事件
        await this.riskEventRepo.create({
            userId:context.userId,
            eventData: {
                type: context.type,
                data: {
                    ...context.metadata,
                    triggers,
                },
            },
            severity,
            score,
            ip: context.ip,
            userAgent: context.userAgent,
            deviceId: context.deviceId,
        });

        // 4️⃣ 执行动作
        await this.riskEventRepo.handleAction({
            severity,
            sessionId: context.sessionId,
            userId: context.userId,
        });

        return { score, severity };
    }
    private async checkNewDevice(ctx: any) {
        const known = await this.riskEventRepo.findRecentDevices(
            ctx.userId
        );

        if (!known.includes(ctx.deviceId)) {
            return {
                triggered: true,
                score: 40,
                reason: "NEW_DEVICE",
            };
        }

        return { triggered: false, score: 0 };
    }

    private async checkIpChange(ctx: any) {
        const lastIp = await this.riskEventRepo.getLastLoginIp(ctx.userId);

        if (lastIp && lastIp !== ctx.ip) {
            return {
                triggered: true,
                score: 30,
                reason: "IP_CHANGE",
            };
        }

        return { triggered: false, score: 0 };
    }

    private async checkSuspiciousIP(ctx: any) {
        if (!ctx.ip) return { triggered: false, score: 0 };

        if (ctx.ip.startsWith("192.168")) {
            return { triggered: false, score: 0 };
        }

        // 👉 可以接第三方 IP 风控服务
        return {
            triggered: true,
            score: 20,
            reason: "UNKNOWN_IP",
        };
    }
}