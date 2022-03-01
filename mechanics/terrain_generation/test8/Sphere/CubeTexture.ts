import { Vector2, Vector3 } from "babylonjs";

export function normalToFace(normal: Vector3): number {
  if     (normal.x ==  1) { return 0 }
  else if(normal.x == -1) { return 2 }
  else if(normal.y ==  1) { return 4 }
  else if(normal.y == -1) { return 5 }
  else if(normal.z ==  1) { return 1 }
  else if(normal.z == -1) { return 3 } 
  throw 'normal is not a normal'
}

export function pointOnCubeToUv(pointOnUnitCube: Vector3, normal: Vector3): Vector2 {
  const p = pointOnUnitCube.add(new Vector3(1,1,1)).divide(new Vector3(2,2,2))

  if     (normal.x ==  1) { // face 0
    const uv = new Vector2(p.z, p.y)
    return remapUv(uv, normalToFace(normal))
  }
  else if(normal.x == -1) { // face 2
    const uv = new Vector2(1 - p.z, p.y)
    return remapUv(uv, normalToFace(normal))
  }
  else if(normal.y ==  1) { // face 4
    const uv = new Vector2(p.z, 1 - p.x)
    return remapUv(uv, normalToFace(normal))
  }
  else if(normal.y == -1) { // face 5
    const uv = new Vector2(p.z, p.x)
    return remapUv(uv, normalToFace(normal))
  }
  else if(normal.z ==  1) { // face 1
    const uv = new Vector2(1 - p.x, p.y)
    return remapUv(uv, normalToFace(normal))
  }
  else if(normal.z == -1) { // face 3
    const uv = new Vector2(p.x, p.y)
    return remapUv(uv, normalToFace(normal))
  } 
  throw 'normal is not a normal'
}

export function remapUv(uv: Vector2, face: number): Vector2 {
  if(face >= 3 && face <= 5) { // first row
    return new Vector2(uv.x / 3 + 1/3 * face, uv.y/2)
  } else if(face >= 0 && face <= 2) { // second row
    return new Vector2(uv.x / 3 + 1/3 * face, uv.y/2 + .5)
  }

  throw 'face must be 0<=f<=5'
}