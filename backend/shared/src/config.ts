import process from "process";

export function requireStrEnv(key: string): string {
  const value: string | undefined = process.env[key];
  if (value === undefined) {
    throw new Error(`${key} must be defined in process.env!`);
  }
  return value;
}

export function requireIntEnv(key: string): number {
  return Number.parseInt(requireStrEnv(key), 10);
}
