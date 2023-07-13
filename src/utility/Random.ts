export function createRandomKey(): string {
  return (Math.random() + 1).toString(36).substring(7) + Date.now();
}
