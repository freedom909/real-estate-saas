export interface ExperiencePrior {
  actionKey: string;
  attempts: number;
  successRate: number;
  avgReward: number;
  confidence: number;
}

export interface ActionScore {
  actionKey: string;
  banditQ: number;
  priorReward: number;
  priorConfidence: number;
  finalScore: number;
}

export function computeFinalActionScore(input: {
  actionKey: string;
  banditQ: number;
  priorReward: number;
  priorConfidence: number;
  lambda?: number;
}): ActionScore {
  const lambda = input.lambda ?? 0.3;

  return {
    actionKey: input.actionKey,
    banditQ: input.banditQ,
    priorReward: input.priorReward,
    priorConfidence: input.priorConfidence,
    finalScore: input.banditQ + lambda * input.priorConfidence * input.priorReward,
  };
}
