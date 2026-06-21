import { BanditDecision, IBandit } from "./i-bandit";

interface LinUCBOptions {
  dimensions: number;
  alpha?: number;
}

interface ActionState {
  a: number[][];
  b: number[];
  updates: number;
}

export class LinUCBBandit implements IBandit {
  private readonly dimensions: number;
  private readonly alpha: number;
  private readonly actions = new Map<string, ActionState>();
  private totalUpdates = 0;

  constructor(options: LinUCBOptions) {
    this.dimensions = options.dimensions;
    this.alpha = options.alpha ?? 0.2;
  }

  selectAction(stateVector: number[], actions: string[]): BanditDecision {
    let bestValue = -Infinity;
    const bestActions: string[] = [];

    for (const action of actions) {
      const value = this.estimateValue(stateVector, action);
      if (value > bestValue) {
        bestValue = value;
        bestActions.length = 0;
        bestActions.push(action);
      } else if (Math.abs(value - bestValue) < 1e-9) {
        bestActions.push(action);
      }
    }

    const bestAction = bestActions[Math.floor(Math.random() * bestActions.length)];

    return {
      action: bestAction,
      value: bestValue,
      explored: false,
    };
  }

  estimateValue(stateVector: number[], action: string): number {
    const actionState = this.getOrCreateActionState(action);
    const inverseA = invertMatrix(actionState.a);
    const theta = multiplyMatrixVector(inverseA, actionState.b);
    const mean = dotProduct(theta, stateVector);
    const uncertainty = Math.sqrt(Math.max(0, quadraticForm(stateVector, inverseA)));

    return mean + this.alpha * uncertainty;
  }

  update(stateVector: number[], action: string, reward: number): void {
    const actionState = this.getOrCreateActionState(action);

    for (let row = 0; row < this.dimensions; row++) {
      for (let column = 0; column < this.dimensions; column++) {
        actionState.a[row][column] += stateVector[row] * stateVector[column];
      }

      actionState.b[row] += reward * stateVector[row];
    }

    actionState.updates++;
    this.totalUpdates++;
  }

  getStats(): Record<string, unknown> {
    return {
      type: "linucb",
      alpha: this.alpha,
      dimensions: this.dimensions,
      actions: this.actions.size,
      totalUpdates: this.totalUpdates,
    };
  }

  private getOrCreateActionState(action: string): ActionState {
    const existing = this.actions.get(action);
    if (existing) {
      return existing;
    }

    const actionState: ActionState = {
      a: identityMatrix(this.dimensions),
      b: new Array(this.dimensions).fill(0),
      updates: 0,
    };
    this.actions.set(action, actionState);
    return actionState;
  }
}

function identityMatrix(size: number): number[][] {
  const matrix: number[][] = [];

  for (let row = 0; row < size; row++) {
    const currentRow = new Array(size).fill(0);
    currentRow[row] = 1;
    matrix.push(currentRow);
  }

  return matrix;
}

function invertMatrix(matrix: number[][]): number[][] {
  const size = matrix.length;
  const augmented = matrix.map((row, index) => [
    ...row.map((value) => value),
    ...identityMatrix(size)[index],
  ]);

  for (let pivotIndex = 0; pivotIndex < size; pivotIndex++) {
    let pivot = augmented[pivotIndex][pivotIndex];

    if (Math.abs(pivot) < 1e-12) {
      for (let candidate = pivotIndex + 1; candidate < size; candidate++) {
        if (Math.abs(augmented[candidate][pivotIndex]) > 1e-12) {
          const temp = augmented[pivotIndex];
          augmented[pivotIndex] = augmented[candidate];
          augmented[candidate] = temp;
          pivot = augmented[pivotIndex][pivotIndex];
          break;
        }
      }
    }

    const pivotFactor = pivot;
    for (let column = 0; column < size * 2; column++) {
      augmented[pivotIndex][column] /= pivotFactor;
    }

    for (let row = 0; row < size; row++) {
      if (row === pivotIndex) {
        continue;
      }

      const factor = augmented[row][pivotIndex];
      if (factor === 0) {
        continue;
      }

      for (let column = 0; column < size * 2; column++) {
        augmented[row][column] -= factor * augmented[pivotIndex][column];
      }
    }
  }

  return augmented.map((row) => row.slice(size));
}

function multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
  return matrix.map((row) => dotProduct(row, vector));
}

function quadraticForm(vector: number[], matrix: number[][]): number {
  const intermediate = multiplyMatrixVector(matrix, vector);
  return dotProduct(vector, intermediate);
}

function dotProduct(left: number[], right: number[]): number {
  let result = 0;

  for (let index = 0; index < left.length; index++) {
    result += left[index] * right[index];
  }

  return result;
}
