import { jest } from "@jest/globals";

export function createMock<T extends object>(): jest.Mocked<T> {
  const cache = new Map<string | symbol, any>();
  return new Proxy(
    {},
    {
      get: (_, prop) => {
        if (prop === "then") return undefined; // Promise safety
        if (!cache.has(prop)) {
          cache.set(prop, jest.fn());
        }
        return cache.get(prop);
      },
    }
  ) as jest.Mocked<T>;
}

