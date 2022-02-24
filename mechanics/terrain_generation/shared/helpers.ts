import { Vector, Vector2 } from "three";

export function Pos1Dto2d(index: number, size: Vector2): Vector2 {
  const x = index % size.x
  const y = Math.floor(index / size.x)
  return new Vector2(x, y)
}

export function position2Dnormalized(position: Vector2, max: Vector2): Vector2 {
  return position.clone().sub(max.clone().multiplyScalar(0.5))
}

export function sumVectors<V extends Vector>(vec1: V, vec2: V): V {
  return vec1.clone().add(vec2) as V
}