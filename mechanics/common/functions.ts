export function sigmoid(x: number): number {
  return Math.pow(Math.E, x) / (Math.pow(Math.E, x) + 1)
}