import { Vector2, Vector3 } from "babylonjs";

export function divideScalar(vec: Vector2, n: number): Vector2 {
  return vec.divide(new Vector2(n,n))
}

export function multiplyScalar(vec: Vector3, n: number): Vector3 {
  return vec.multiply(new Vector3(n,n,n))
}