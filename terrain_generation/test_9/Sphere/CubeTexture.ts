import { Vector2, Vector3 } from "three";

function normalToGrid(normal: Vector3): Vector2 {
  if     (normal.x ==  1) { return new Vector2(0, 1) } // face 0
  else if(normal.x == -1) { return new Vector2(2, 1) } // face 2
  else if(normal.y ==  1) { return new Vector2(1, 0) } // face 4
  else if(normal.y == -1) { return new Vector2(2, 0) } // face 5
  else if(normal.z ==  1) { return new Vector2(1, 1) } // face 1
  else if(normal.z == -1) { return new Vector2(0, 0) } // face 3
  throw 'normal is not a normal'
}

function normalToFace(normal: Vector3): number {
  if     (normal.x ==  1) { return 0 }
  else if(normal.x == -1) { return 2 }
  else if(normal.y ==  1) { return 4 }
  else if(normal.y == -1) { return 5 }
  else if(normal.z ==  1) { return 1 }
  else if(normal.z == -1) { return 3 } 
  throw 'normal is not a normal'
}

// const textureSize = new Vector2(12, 8)

export function cubeToUv(pointOnUnitCube: Vector3, normal: Vector3): Vector2 {
  const gridPos = normalToGrid(normal)

  const p = pointOnUnitCube.addScalar(1).divideScalar(2)

  let percent: Vector2 = new Vector2()

  switch(normalToFace(normal)) {
    case 0: percent = new Vector2(p.z, p.y); break;
    case 1: percent = new Vector2(1-p.x, p.y); break;
    case 2: percent = new Vector2(1-p.z, p.y); break;
    case 3: percent = new Vector2(p.x, p.y); break;
    case 4: percent = new Vector2(p.z, 1-p.x); break;
    case 5: percent = new Vector2(p.z, p.x); break;
  }

  let uv = percent.clone().divide(new Vector2(3, 2)).add(gridPos.divide(new Vector2(3, 2)))

  return uv
}

// -------------------------------------------------------------------------------

function faceToNormal(face: number): Vector3 {
  switch(face){
    case 0: return new Vector3( 1,  0,  0)
    case 2: return new Vector3(-1,  0,  0)
    case 1: return new Vector3( 0,  0,  1)
    case 3: return new Vector3( 0,  0, -1)
    case 4: return new Vector3( 0,  1,  0)
    case 5: return new Vector3( 0, -1,  0)
  }
  throw 'face must be 0<=f<=5'
}

function uvToFace(uv: Vector2): number {
  if(uv.y >= 0 && uv.y < 1/2) { //row 2
    if(uv.x >= 0 && uv.x < 1/3) { return 3 }
    if(uv.x >= 1/3 && uv.x < 2/3) { return 4 }
    if(uv.x >= 2/3 && uv.x < 1) { return 5 }
  } else if(uv.y >= 1/2 && uv.y <= 1) { //row 1
    if(uv.x >= 0 && uv.x < 1/3) { return 0 }
    if(uv.x >= 1/3 && uv.x < 2/3) { return 1 }
    if(uv.x >= 2/3 && uv.x < 1) { return 2 }
  }
  throw 'uv coords must be 0<=uv<=1'
}

// x:0.3333333333333333, y:0
export function uvToCube(uv: Vector2): {normal: Vector3, position: Vector3 } {
  const normal = faceToNormal(uvToFace(uv)) // 0,1,0

  const pos = new Vector2(
    (uv.x % (1/3)) * 3 * 2 - 1, // ((1/3) % (1/3)) * 3 * 2 - 1  => -1
    (uv.y % (1/2)) * 2 * 2 - 1  // ((0) % (1/2)) * 2 * 2 - 1    => -1
  )
  let pointOnUnitCube = new Vector3()

  switch(uvToFace(uv)) {
    case 0: pointOnUnitCube = new Vector3(     1, pos.y,  pos.x); break;
    case 2: pointOnUnitCube = new Vector3(    -1, pos.y, -pos.x); break;
    case 1: pointOnUnitCube = new Vector3(-pos.x, pos.y,      1); break;
    case 3: pointOnUnitCube = new Vector3( pos.x, pos.y,     -1); break;
    case 4: pointOnUnitCube = new Vector3(-pos.y,     1, pos.x); break;
    case 5: pointOnUnitCube = new Vector3( pos.y,    -1,  pos.x); break;
    default: throw 'error in converting uv to face'
  }

  const cube = pointOnUnitCube.clone()

  const x2 = cube.x * cube.x
  const y2 = cube.y * cube.y
  const z2 = cube.z * cube.z

  const px = cube.x * Math.sqrt(1 - (y2+z2) / 2 + (y2 * z2) / 3)
  const py = cube.y * Math.sqrt(1 - (z2+x2) / 2 + (z2 * x2) / 3)
  const pz = cube.z * Math.sqrt(1 - (x2+y2) / 2 + (x2 * y2) / 3)

  const position = new Vector3(px, py, pz)

  
  // const position = pointOnUnitCube.normalize()
  
  return { normal, position }
}

// -------------------------------------------------------------------------------

export function cubeToCartesian(pointOnUnitCube: Vector3, normal: Vector3, size: Vector2): Vector2 {
  const gridPos = normalToGrid(normal)

  const p = pointOnUnitCube.addScalar(1).divideScalar(2)

  let percent: Vector2 = new Vector2()

  switch(normalToFace(normal)) {
    case 0: percent = new Vector2(p.z, p.y); break;
    case 1: percent = new Vector2(1-p.x, p.y); break;
    case 2: percent = new Vector2(1-p.z, p.y); break;
    case 3: percent = new Vector2(p.x, p.y); break;
    case 4: percent = new Vector2(p.z, 1-p.x); break;
    case 5: percent = new Vector2(p.z, p.x); break;
  }

  const gridsize = size.clone().divide(new Vector2(3, 2))
  const pixelStart = gridPos.clone().multiply(gridsize)

  const pixelExtra = new Vector2(
    Math.round(percent.x * (gridsize.x - 1)),
    Math.round(percent.y * (gridsize.y - 1)),
  )

  return pixelStart.add(pixelExtra)
}