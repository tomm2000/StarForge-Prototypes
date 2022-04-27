import { Vector2 } from "three";

export function matrixToArrayPos(pos: Vector2, size: Vector2): number {
  return pos.x + pos.y * size.x
}