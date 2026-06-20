import { describe, expect, it } from "@jest/globals";
import { ParameterizedAction, toActionKey } from "../../../ai-platform/action/parameterized-actions";
import { ContextualBandit } from "../../../ai-platform/learning/contextual-bandit";

describe("parameterized action learning", () => {
  it("builds different action keys for different coupon values", () => {
    const coupon1000: ParameterizedAction = {
      type: "send_coupon",
      name: "Send Coupon (¥1000)",
      parameters: { value: 1000 },
    };
    const coupon5000: ParameterizedAction = {
      type: "send_coupon",
      name: "Send Coupon (¥5000)",
      parameters: { value: 5000 },
    };

    expect(toActionKey(coupon1000)).toBe("send_coupon:value=1000");
    expect(toActionKey(coupon5000)).toBe("send_coupon:value=5000");
  });

  it("tracks Q values independently for different parameterized actions", () => {
    const bandit = new ContextualBandit();
    const stateKey = "booking=confirmed|channel=airbnb|hours=48";
    const coupon1000Key = "send_coupon:value=1000";
    const coupon5000Key = "send_coupon:value=5000";

    bandit.updateQ(stateKey, coupon1000Key, 0.8);
    bandit.updateQ(stateKey, coupon5000Key, 0.2);

    expect(bandit.getQ(stateKey, coupon1000Key).qValue).toBeGreaterThan(
      bandit.getQ(stateKey, coupon5000Key).qValue,
    );
  });
});
