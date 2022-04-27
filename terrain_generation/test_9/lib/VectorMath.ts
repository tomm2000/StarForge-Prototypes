import { Vector2, Vector3 } from "three";

export function divideScalar(vec: Vector2, n: number): Vector2 {
  return vec.divide(new Vector2(n,n))
}

export function multiplyScalar(vec: Vector3, n: number): Vector3 {
  return vec.multiply(new Vector3(n,n,n))
}

export function v3String(vec: Vector3): string {
  return `x:${vec.x}, y:${vec.y}, z:${vec.z}`
}

export function v3StringRound(vec: Vector3): string {
  return `x:${Math.round(vec.x)}, y:${Math.round(vec.y)}, z:${Math.round(vec.y)}`
}

export function v2String(vec: Vector2): string {
  return `x:${vec.x}, y:${vec.y}`
}

export function v2StringRound(vec: Vector2): string {
  return `x:${Math.round(vec.x)}, y:${Math.round(vec.y)}`
}