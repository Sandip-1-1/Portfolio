type Handler = (payload: any) => void;

class GameEventBus {
  private handlers = new Map<string, Set<Handler>>();

  on(event: string, handler: Handler) {
    const group = this.handlers.get(event) ?? new Set<Handler>();
    group.add(handler);
    this.handlers.set(event, group);
  }

  off(event: string, handler: Handler) {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: string, payload: unknown) {
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  }
}

export const gameEvents = new GameEventBus();
