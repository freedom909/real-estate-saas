import { describe, expect, it } from "@jest/globals";
import { StateEncoderV2 } from "../../../ai-platform/reasoning/state-encoder";
import { ContextualBandit } from "../../../ai-platform/learning/contextual-bandit";
import { TabularBanditAdapter } from "../../../ai-platform/learning/tabular-bandit-adapter";
import { LinUCBBandit } from "../../../ai-platform/learning/linucb-bandit";
import { AlphaGoStyleAgent } from "../../../ai-platform/agent/alpha-go-style-agent";

function createState(hoursBeforeCheckin: number) {
  return {
    booking: {
      status: "confirmed",
      channel: "airbnb",
      hoursBeforeCheckin,
      amount: 15000,
    },
    payment: {
      method: "credit_card",
      status: "paid",
      amount: 15000,
    },
  };
}

describe("bandit generalization", () => {
  it("tabular adapter keeps nearby states isolated", () => {
    const encoder = new StateEncoderV2();
    const bandit = new TabularBanditAdapter(new ContextualBandit());
    const actionKey = "send_coupon:value=2000";

    const x48 = encoder.encode(createState(48)).values;
    const x47 = encoder.encode(createState(47)).values;

    for (let i = 0; i < 10; i++) {
      bandit.update(x48, actionKey, 0.8);
    }

    const trained = bandit.estimateValue(x48, actionKey);
    const adjacent = bandit.estimateValue(x47, actionKey);

    expect(trained).toBeGreaterThan(adjacent);
    expect(adjacent).toBeCloseTo(0.5, 5);
  });

  it("linucb shares reward information with nearby states but not distant ones", () => {
    const encoder = new StateEncoderV2();
    const actionKey = "send_coupon:value=2000";
    const dimensions = encoder.encode(createState(48)).values.length;
    const bandit = new LinUCBBandit({ dimensions, alpha: 0.2 });

    const x48 = encoder.encode(createState(48)).values;
    const x47 = encoder.encode(createState(47)).values;
    const x49 = encoder.encode(createState(49)).values;
    const x120 = encoder.encode(createState(120)).values;

    for (let i = 0; i < 20; i++) {
      bandit.update(x48, actionKey, 0.8);
    }
    for (let i = 0; i < 10; i++) {
      bandit.update(x120, actionKey, 0.2);
    }

    const near47 = bandit.estimateValue(x47, actionKey);
    const center48 = bandit.estimateValue(x48, actionKey);
    const near49 = bandit.estimateValue(x49, actionKey);
    const far120 = bandit.estimateValue(x120, actionKey);

    expect(center48).toBeGreaterThan(far120);
    expect(near47).toBeGreaterThan(far120);
    expect(near49).toBeGreaterThan(far120);
  });

  it("agent accepts banditType configuration", () => {
    const tabularAgent = new AlphaGoStyleAgent({
      bookingId: "BKG-001",
      paymentId: "PAY-001",
      banditType: "tabular",
    });
    const linucbAgent = new AlphaGoStyleAgent({
      bookingId: "BKG-002",
      paymentId: "PAY-002",
      banditType: "linucb",
    });

    expect(tabularAgent).toBeDefined();
    expect(linucbAgent).toBeDefined();
  });
});
