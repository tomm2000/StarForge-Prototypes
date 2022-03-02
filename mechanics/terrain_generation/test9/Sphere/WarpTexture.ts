import { Vector2, Vector3 } from "three";

type Coordinate = {
  latitude: number,
  longitude: number
}

export function pointToUv(pointOnUnitSphere: Vector3): Vector2 {
  const coordinates = pointToCoordinate(pointOnUnitSphere)
  return coordinateToUv(coordinates)
}

export function uvToPoint(uv: Vector2): Vector3 {
  const coordinates = uvToCoordinate(uv)
  return coordinateToPoint(coordinates)
}

function coordinateToUv(coordinate: Coordinate): Vector2 {
  return new Vector2(
    (coordinate.longitude + Math.PI) / (Math.PI*2),
    (coordinate.latitude + Math.PI/2) / Math.PI,
  )
}

function pointToCoordinate(pointOnUnitSphere: Vector3): Coordinate {
  const latitude  = Math.asin(pointOnUnitSphere.y)
  const longitude = Math.atan2(pointOnUnitSphere.x, -pointOnUnitSphere.z)
  return {latitude, longitude}
}

function uvToCoordinate(uv: Vector2): Coordinate {
  const latitude  = uv.y * Math.PI   - Math.PI/2
  const longitude = uv.x * Math.PI*2 - Math.PI
  return {latitude, longitude}
}

function coordinateToPoint(coordinate: Coordinate): Vector3 {
  const y = Math.sin(coordinate.latitude)
  const r = Math.cos(coordinate.latitude)
  const x = Math.sin(coordinate.longitude) * r
  const z = -Math.cos(coordinate.longitude) * r
  return new Vector3(x,y,z)
}