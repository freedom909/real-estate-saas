
/**
 * Action Registry - 开放动作空间！
 *
 * Agent 不需要预先知道所有动作，运行时发现！
 */

export interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  defaultParams: Record<string, any>;
}

export class ActionRegistry {
  private actions: Map<string, ActionDefinition> = new Map();

  register(action: ActionDefinition): void {
    this.actions.set(action.id, action);
    console.log(`📋 [ActionRegistry] Registered action: ${action.name} (${action.id})`);
  }

  get(id: string): ActionDefinition | undefined {
    return this.actions.get(id);
  }

  getAll(): ActionDefinition[] {
    return Array.from(this.actions.values());
  }

  getByCategory(category: string): ActionDefinition[] {
    return Array.from(this.actions.values()).filter(a => a.category === category);
  }
}

/**
 * 预注册一些真实业务动作
 */
export function registerDefaultActions(registry: ActionRegistry): void {
  registry.register({
    id: "booking.cancel",
    name: "Cancel Booking",
    description: "Cancel a booking",
    category: "booking",
    defaultParams: {}
  });

  registry.register({
    id: "payment.refund",
    name: "Full Refund",
    description: "Issue a full refund",
    category: "payment",
    defaultParams: {}
  });

  registry.register({
    id: "payment.partial_refund",
    name: "Partial Refund",
    description: "Issue a partial refund",
    category: "payment",
    defaultParams: { percentage: 50 }
  });

  registry.register({
    id: "booking.send_coupon",
    name: "Send Coupon",
    description: "Send a discount coupon to customer",
    category: "customer",
    defaultParams: { value: 1000 }
  });

  registry.register({
    id: "booking.change_checkin_date",
    name: "Change Checkin Date",
    description: "Modify checkin date",
    category: "booking",
    defaultParams: { newDate: "2026-07-05" }
  });

  registry.register({
    id: "booking.offer_upgrade",
    name: "Offer Upgrade",
    description: "Offer a room upgrade",
    category: "booking",
    defaultParams: { upgradeType: "deluxe" }
  });

  registry.register({
    id: "host.contact",
    name: "Contact Host",
    description: "Contact the host to resolve issue",
    category: "communication",
    defaultParams: {}
  });

  registry.register({
    id: "guest.contact",
    name: "Contact Guest",
    description: "Contact the guest to find solution",
    category: "communication",
    defaultParams: {}
  });

  registry.register({
    id: "wait_24h",
    name: "Wait 24 Hours",
    description: "Do nothing and wait",
    category: "other",
    defaultParams: {}
  });

  registry.register({
    id: "escalate_to_human",
    name: "Escalate to Human Agent",
    description: "Escalate to human customer support",
    category: "other",
    defaultParams: {}
  });
}
