// src/security/builder/securityEvent.builder.ts
import { randomUUID } from "crypto";

interface Actor {
  userId: string | null;
  role: string;
  isAuthenticated: boolean;
}

interface Context {
  ip: string;
  userAgent?: string;
  method?: string;
  path?: string;
  payloadSize?: number;
}

interface Resource {
  type: string;
  id?: string | null;
}

interface Signals {
  [key: string]: any;
}

export interface SecurityEvent {
  eventId: string;
  action: string;
  timestamp: string;
  actor: Actor;
  context: Context;
  resource: Resource;
  payload: any;
  signals: Signals;
}

export class SecurityEventBuilder {
  private action!: string;
  private actor?: { id: string; role?: string };
  private context?: Context;
  private resource?: Resource;
  private payload?: any;
  private signals: Signals = {};

  // 🔥 正确的 create
  static create(action: string): SecurityEventBuilder {
    const builder = new SecurityEventBuilder();
    builder.action = action;
    return builder;
  }

  withActor(actor: { userId: string; role?: string }) {
    this.actor = {
      id: actor.userId,
      role: actor.role,
    };
    return this;
  }

  withContext(context: Context) {
    this.context = context;
    return this;
  }

  withResource(resource: Resource) {
    this.resource = resource;
    return this;
  }

  withPayload(payload: any) {
    this.payload = payload;
    return this;
  }

  withSignals(signals: Signals) {
    this.signals = signals;
    return this;
  }

  build(): SecurityEvent {
    return {
      eventId: `evt_${randomUUID()}`,
      action: this.action,
      timestamp: new Date().toISOString(),
      actor: this.buildActor(this.actor),
      context: this.buildContext(this.context),
      resource: this.buildResource(this.resource),
      payload: this.sanitizePayload(this.payload),
      signals: this.signals,
    };
  }

  // -------- private helpers --------

  private buildActor(user?: { id: string; role?: string }): Actor {
    if (!user) {
      return {
        userId: null,
        role: "ANONYMOUS",
        isAuthenticated: false,
      };
    }

    return {
      userId: user.id,
      role: user.role ?? "USER",
      isAuthenticated: true,
    };
  }

  private buildContext(context?: Context): Context {
    return {
      ip: context?.ip ?? null,
      userAgent: context?.userAgent ?? null,
      method: context?.method ?? null,
      path: context?.path ?? null,
      payloadSize: context?.payloadSize ?? null,
    };
  }

  private buildResource(resource?: Resource): Resource {
    return {
      type: resource?.type ?? "UNKNOWN",
      id: resource?.id ?? null,
    };
  }

  private sanitizePayload(payload: any): any {
    if (!payload) return null;

    const clone = JSON.parse(JSON.stringify(payload));
    delete clone.password;
    delete clone.token;
    delete clone.refreshToken;

    return clone;
  }
}
