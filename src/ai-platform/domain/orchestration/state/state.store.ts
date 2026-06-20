import { WorldState, StateQuery, WorldStateSnapshot, StateDiff } from "./world-state";

export class StateStore {
  private currentState: WorldState;
  private history: WorldStateSnapshot[] = [];

  constructor(initialState: WorldState = {}) {
    this.currentState = this.deepClone(initialState);
    this.addToHistory();
  }

  getState(): WorldState {
    return this.deepClone(this.currentState);
  }

  setState(state: WorldState): void {
    this.currentState = this.deepClone(state);
    this.addToHistory();
  }

  get(query: string | StateQuery): any {
    if (typeof query === "string") {
      const [entity, field] = query.split(".");
      return this.currentState[entity]?.[field];
    }
    return this.currentState[query.entity]?.[query.field];
  }

  set(query: string | StateQuery, value: any): void {
    if (typeof query === "string") {
      const [entity, field] = query.split(".");
      this.ensureEntityExists(entity);
      this.currentState[entity][field] = value;
    } else {
      this.ensureEntityExists(query.entity);
      this.currentState[query.entity][query.field] = value;
    }
    this.addToHistory();
  }

  patch(changes: { entity: string; field: string; value: any }[]): void {
    changes.forEach(change => {
      this.ensureEntityExists(change.entity);
      this.currentState[change.entity][change.field] = change.value;
    });
    this.addToHistory();
  }

  getHistory(): WorldStateSnapshot[] {
    return this.history.map(snapshot => ({
      timestamp: snapshot.timestamp,
      state: this.deepClone(snapshot.state)
    }));
  }

  rollbackTo(timestamp: number): boolean {
    const snapshotIndex = this.history.findIndex(s => s.timestamp === timestamp);
    if (snapshotIndex === -1) {
      return false;
    }

    this.currentState = this.deepClone(this.history[snapshotIndex].state);
    this.history = this.history.slice(0, snapshotIndex + 1);
    this.addToHistory();
    return true;
  }

  compare(before: WorldState, after: WorldState): StateDiff {
    const added: StateDiff["added"] = [];
    const removed: StateDiff["removed"] = [];
    const modified: StateDiff["modified"] = [];

    const allEntities = new Set([...Object.keys(before), ...Object.keys(after)]);
    allEntities.forEach(entity => {
      const beforeEntity = before[entity] || {};
      const afterEntity = after[entity] || {};
      const allFields = new Set([...Object.keys(beforeEntity), ...Object.keys(afterEntity)]);

      allFields.forEach(field => {
        const beforeValue = beforeEntity[field];
        const afterValue = afterEntity[field];

        if (beforeValue === undefined && afterValue !== undefined) {
          added.push({ entity, field, value: afterValue });
        } else if (beforeValue !== undefined && afterValue === undefined) {
          removed.push({ entity, field });
        } else if (beforeValue !== afterValue) {
          modified.push({ entity, field, oldValue: beforeValue, newValue: afterValue });
        }
      });
    });

    return { added, removed, modified };
  }

  private ensureEntityExists(entity: string): void {
    if (!this.currentState[entity]) {
      this.currentState[entity] = {};
    }
  }

  private addToHistory(): void {
    this.history.push({
      timestamp: Date.now(),
      state: this.deepClone(this.currentState)
    });
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}
