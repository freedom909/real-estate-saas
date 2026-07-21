let counter = 0;

export function v4(): string {
  counter++;
  return `mock-uuid-${counter}-${Date.now()}`;
}

export function v1(): string {
  return v4();
}

export function v5(): string {
  return v4();
}

export function v6(): string {
  return v4();
}

export function v7(): string {
  return v4();
}

export const MAX = "ffffffff-ffff-ffff-ffff-ffffffffffff";
export const NIL = "00000000-0000-0000-0000-000000000000";

export function validate(uuid: string): boolean {
  return typeof uuid === "string";
}

export function version(uuid: string): number {
  return 4;
}

export function parse(uuid: string): number[] {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}

export function stringify(arr: number[]): string {
  return v4();
}

export function arrayify(uuid: string): number[] {
  return parse(uuid);
}

export function unparse(arr: number[]): string {
  return stringify(arr);
}
