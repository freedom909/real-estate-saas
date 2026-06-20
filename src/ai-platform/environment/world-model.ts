
/**
 * 世界模型
 *
 * 持久化的世界状态
 * - Booking DB
 * - Payment DB
 * - Listing DB
 */

export interface EntityState {
  [entity: string]: any;
}

export interface WorldStateSnapshot {
  timestamp: number;
  state: EntityState;
}

export class WorldModel {
  private state: EntityState;
  private history: WorldStateSnapshot[];
  private maxHistory: number = 1000;

  constructor(initialState?: EntityState) {
    this.state = initialState || {};
    this.history = [];
  }

  /**
   * 获取当前世界状态
   */
  getState(): EntityState {
    return { ...this.state };
  }

  /**
   * 更新世界状态
   */
  updateState(updates: EntityState): void {
    this.takeSnapshot();

    for (const [entity, data] of Object.entries(updates)) {
      if (!this.state[entity]) {
        this.state[entity] = {};
      }
      this.state[entity] = { ...this.state[entity], ...data };
    }
  }

  /**
   * 直接设置整个实体
   */
  setEntity(entity: string, data: any): void {
    this.takeSnapshot();
    this.state[entity] = { ...data };
  }

  /**
   * 获取实体
   */
  getEntity(entity: string): any {
    return this.state[entity] ? { ...this.state[entity] } : undefined;
  }

  private takeSnapshot(): void {
    this.history.push({
      timestamp: Date.now(),
      state: { ...this.state }
    });

    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * 获取历史快照
   */
  getHistory(limit: number = 100): WorldStateSnapshot[] {
    return this.history.slice(-limit);
  }

  /**
   * 重置世界（测试用）
   */
  reset(initialState?: EntityState): void {
    this.state = initialState || {};
    this.history = [];
  }
}
