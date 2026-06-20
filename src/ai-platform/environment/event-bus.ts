
/**
 * 事件总线
 *
 * 用于 Agent 各组件间通信
 */

export interface Event {
  id: string;
  type: string;
  timestamp: number;
  payload: any;
}

export interface EventListener {
  (event: Event): void;
}

export class EventBus {
  private listeners: Map<string, EventListener[]> = new Map();
  private eventHistory: Event[] = [];
  private maxHistory: number = 1000;

  /**
   * 发布事件
   */
  publish(eventType: string, payload: any): void {
    const event: Event = {
      id: `evt:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      timestamp: Date.now(),
      payload
    };

    console.log(`📢 [EventBus] ${eventType}`, payload);
    this.eventHistory.push(event);

    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory.shift();
    }

    const listeners = this.listeners.get(eventType) || [];
    for (const listener of listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error(`❌ [EventBus] Listener error:`, err);
      }
    }
  }

  /**
   * 订阅事件
   */
  subscribe(eventType: string, listener: EventListener): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(listener);

    return () => {
      this.unsubscribe(eventType, listener);
    };
  }

  /**
   * 取消订阅
   */
  unsubscribe(eventType: string, listener: EventListener): void {
    const listeners = this.listeners.get(eventType);
    if (!listeners) return;

    const idx = listeners.indexOf(listener);
    if (idx > -1) {
      listeners.splice(idx, 1);
    }
  }

  /**
   * 获取事件历史
   */
  getHistory(eventType?: string, limit: number = 100): Event[] {
    let events = this.eventHistory;
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }
    return events.slice(-limit);
  }
}
