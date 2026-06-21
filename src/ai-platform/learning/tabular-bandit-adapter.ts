import { ContextualBandit } from "./contextual-bandit";
import { BanditDecision, IBandit } from "./i-bandit";

export class TabularBanditAdapter implements IBandit {
  constructor(private readonly bandit: ContextualBandit) {}

  selectAction(stateVector: number[], actions: string[]): BanditDecision {
    const stateKey = this.vectorToKey(stateVector);
    const decision = this.bandit.selectAction(stateKey, actions);

    return {
      action: decision.action,
      value: decision.qValue,
      explored: decision.explored,
    };
  }

  estimateValue(stateVector: number[], action: string): number {
    const stateKey = this.vectorToKey(stateVector);
    return this.bandit.getQ(stateKey, action).qValue;
  }

  update(stateVector: number[], action: string, reward: number): void {
    const stateKey = this.vectorToKey(stateVector);
    this.bandit.updateQ(stateKey, action, reward);
  }

  getStats(): Record<string, unknown> {
    return {
      type: "tabular",
      ...this.bandit.getStats(),
    };
  }

  decayExploration(): void {
    this.bandit.decayEpsilon();
  }

  private vectorToKey(stateVector: number[]): string {
    return stateVector
      .map((value) => value.toFixed(6))
      .join("|");
  }
}
