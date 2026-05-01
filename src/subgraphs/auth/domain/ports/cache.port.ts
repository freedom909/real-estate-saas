//// domain/ports/cache.port.ts

export interface CachePort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  incr(key: string): Promise<number>;
  del(key: string): Promise<void>;
}