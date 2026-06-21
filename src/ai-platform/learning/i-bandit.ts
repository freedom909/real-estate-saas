export interface BanditDecision {
  action: string;
  value: number;
  explored: boolean;
}

export interface IBandit {
  selectAction(
    stateVector: number[],
    actions: string[],
  ): BanditDecision;

  estimateValue(
    stateVector: number[],
    action: string,
  ): number;

  update(
    stateVector: number[],
    action: string,
    reward: number,
  ): void;

  getStats(): Record<string, unknown>;

  decayExploration?(): void;
}
