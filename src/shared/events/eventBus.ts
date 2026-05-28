// infrastructure/event/eventBus.ts
export class EventBus {
  private handlers = new Map<string, Function[]>();

  on(eventName: string, handler: Function) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async emit(event: any) {
    const name = event.constructor.name;
    const handlers = this.handlers.get(name) || [];

    for (const h of handlers) {
      await h(event);
    }
  }
}