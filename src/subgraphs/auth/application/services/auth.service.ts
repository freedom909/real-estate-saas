//src/subgraphs/auth/application/services/auth.service.ts

import { inject, injectable } from "tsyringe";

import { SessionService }
    from "../../infrastructure/services/session.service";

import { AuditLogService }
    from "@/modules/audit/application/write/services/audit-log.service";

import { TOKENS_AUDIT }
    from "@/modules/tokens/ai/audit.tokens";

import { OAuth2Client }
    from "google-auth-library";


@injectable()
export class AuthService {

    private client =
        new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID
        );

    constructor(
        private readonly sessionService:
            SessionService,

        @inject(
            TOKENS_AUDIT.services.auditLog
        )
        private readonly auditLogService:
            AuditLogService
    ) { }

    async loginWithGoogle(
        input: {
            token: string;
            ip?: string;
            userAgent?: string;
            deviceId?: string;
        }
    ) {

        try {

            const ticket =
                await this.client.verifyIdToken({
                    idToken:
                        input.token,

                    audience:
                        process.env
                            .GOOGLE_CLIENT_ID,
                });

            const payload =
                ticket.getPayload();

            if (!payload?.sub) {
                throw new Error(
                    "Invalid Google token"
                );
            }

            const userId =
                payload.sub;

            return await this.sessionService
                .createSession({
                    userId,

                    ip:
                        input.ip,

                    userAgent:
                        input.userAgent,

                    deviceId:
                        input.deviceId,
                });

        } catch (error) {

            await this.auditLogService
                .writeAuditLog({
                    action:
                        "USER_LOGIN_FAILED",

                    resourceId:
                        "oauth",

                    resourceType:
                        "AUTH",

                    status:
                        "FAILED",

                    meta: {
                        ip:
                            input.ip,

                        userAgent:
                            input.userAgent,

                        provider:
                            "GOOGLE",

                        reason:
                            error.message,

                    },
                });

            throw error;
        }
    }
}