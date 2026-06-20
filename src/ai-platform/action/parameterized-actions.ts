
/**
 * Parameterized Action Space - 参数化动作空间！
 *
 * 不再是：
 *   10个固定动作
 *
 * 而是：
 *   动作类型 + 参数
 *
 * 例如：
 *   - refund(0.3), refund(0.5), refund(0.8)
 *   - coupon(2000), coupon(5000)
 *
 * Agent 可以学习最佳参数！
 */

export interface ParameterizedAction {
  type: string;
  parameters: Record<string, any>;
  name: string;
}

export function toActionKey(action: ParameterizedAction): string {
  const entries = Object.entries(action.parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`);

  return entries.length > 0
    ? `${action.type}:${entries.join(",")}`
    : action.type;
}

export interface ActionTemplate {
  type: string;
  name: string;
  parameterSchema: {
    [paramName: string]: {
      type: "number" | "string" | "boolean";
      min?: number;
      max?: number;
      defaultValue?: any;
      possibleValues?: any[];
    };
  };
}

export class ParameterizedActionSpace {
  private templates: ActionTemplate[] = [];

  constructor() {
    // 注册基础动作模板
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates(): void {
    // 取消
    this.templates.push({
      type: "cancel",
      name: "Cancel Booking",
      parameterSchema: {}
    });

    // 全额退款
    this.templates.push({
      type: "refund",
      name: "Full Refund",
      parameterSchema: {}
    });

    // 部分退款（参数化）
    this.templates.push({
      type: "partial_refund",
      name: "Partial Refund",
      parameterSchema: {
        ratio: {
          type: "number",
          min: 0.1,
          max: 0.9,
          defaultValue: 0.5
        }
      }
    });

    // 优惠券（参数化）
    this.templates.push({
      type: "send_coupon",
      name: "Send Coupon",
      parameterSchema: {
        value: {
          type: "number",
          min: 500,
          max: 10000,
          defaultValue: 1000
        }
      }
    });

    // 改期
    this.templates.push({
      type: "change_checkin",
      name: "Change Checkin Date",
      parameterSchema: {
        daysLater: {
          type: "number",
          min: 1,
          max: 14,
          defaultValue: 3
        }
      }
    });

    // 联系客人
    this.templates.push({
      type: "contact_guest",
      name: "Contact Guest",
      parameterSchema: {
        urgency: {
          type: "string",
          possibleValues: ["low", "medium", "high"],
          defaultValue: "medium"
        }
      }
    });
  }

  /**
   * 生成候选动作（含参数变体）
   */
  generateCandidateActions(): ParameterizedAction[] {
    const candidates: ParameterizedAction[] = [];
    const seenKeys = new Set<string>();

    for (const template of this.templates) {
      const shouldGenerateVariants =
        template.type === "partial_refund" || template.type === "send_coupon";

      if (!shouldGenerateVariants) {
        this.addCandidate(
          candidates,
          seenKeys,
          {
            type: template.type,
            parameters: this.getDefaultParams(template),
            name: template.name
          }
        );
      }

      // 参数化动作变体
      if (template.type === "partial_refund") {
        for (const ratio of [0.3, 0.5, 0.7, 0.8]) {
          this.addCandidate(
            candidates,
            seenKeys,
            {
              type: "partial_refund",
              parameters: { ratio },
              name: `Partial Refund (${ratio * 100}%)`
            }
          );
        }
      }

      if (template.type === "send_coupon") {
        for (const value of [1000, 2000, 3000, 5000]) {
          this.addCandidate(
            candidates,
            seenKeys,
            {
              type: "send_coupon",
              parameters: { value },
              name: `Send Coupon (¥${value})`
            }
          );
        }
      }
    }

    return candidates;
  }

  /**
   * 获取默认参数
   */
  private getDefaultParams(template: ActionTemplate): Record<string, any> {
    const params: Record<string, any> = {};

    for (const [paramName, schema] of Object.entries(template.parameterSchema)) {
      params[paramName] = schema.defaultValue;
    }

    return params;
  }

  /**
   * 获取所有模板
   */
  getTemplates(): ActionTemplate[] {
    return [...this.templates];
  }

  private addCandidate(
    candidates: ParameterizedAction[],
    seenKeys: Set<string>,
    action: ParameterizedAction
  ): void {
    const actionKey = toActionKey(action);
    if (seenKeys.has(actionKey)) {
      return;
    }

    seenKeys.add(actionKey);
    candidates.push(action);
  }
}
