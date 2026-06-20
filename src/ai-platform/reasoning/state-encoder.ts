
/**
 * State Encoder V2 - 使用连续特征向量！
 *
 * 不再是 One-Hot 桶，而是真实连续值！
 *
 * 例如：
 *   hoursBeforeCheckin: 48 → 48 / 720 = 0.067
 *   amount: 15000 → 15000 / 100000 = 0.15
 *
 * 这样 50h 和 72h 的相似度会比 50h 和 2h 更高！
 */

export interface StateVector {
  values: number[];
  features: string[];
}

export class StateEncoderV2 {
  // 特征定义（混合类型：分类+连续）
  private features: string[] = [
    "booking.confirmed", // 1 if confirmed
    "booking.channel.airbnb", // 1 if channel=airbnb
    "booking.channel.direct", // 1 if channel=direct
    "payment.method.credit_card", // 1 if credit_card
    "payment.method.paypay", // 1 if paypay
    "payment.paid", // 1 if paid
    "hours_before_checkin_normalized", // 0-1, continuous
    "amount_normalized" // 0-1, continuous
  ];

  private maxHours: number = 720; // 30 days
  private maxAmount: number = 100000; // 100k

  /**
   * 编码状态为向量
   */
  encode(state: any): StateVector {
    const values = new Array(this.features.length).fill(0);

    // 分类特征 (One-Hot)
    if (state.booking?.status === "confirmed") values[0] = 1;
    if (state.booking?.channel === "airbnb") values[1] = 1;
    if (state.booking?.channel === "direct") values[2] = 1;
    if (state.payment?.method === "credit_card") values[3] = 1;
    if (state.payment?.method === "paypay") values[4] = 1;
    if (state.payment?.status === "paid") values[5] = 1;

    // 连续特征 (Normalized)
    if (state.booking?.hoursBeforeCheckin !== undefined) {
      values[6] = Math.min(1, state.booking.hoursBeforeCheckin / this.maxHours);
    }
    if (state.payment?.amount !== undefined) {
      values[7] = Math.min(1, state.payment.amount / this.maxAmount);
    }

    return {
      values,
      features: this.features
    };
  }

  /**
   * 计算余弦相似度
   */
  cosineSimilarity(vecA: StateVector, vecB: StateVector): number {
    if (vecA.values.length !== vecB.values.length) {
      throw new Error("Vectors must have same length");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.values.length; i++) {
      dotProduct += vecA.values[i] * vecB.values[i];
      normA += vecA.values[i] * vecA.values[i];
      normB += vecB.values[i] * vecB.values[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
