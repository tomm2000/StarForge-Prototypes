import { Mesh, NoiseProceduralTexture, RawTexture, Scene, Vector2, Vector3 } from "babylonjs"
import { makeNoise3D } from "open-simplex-noise"
import { multiplyScalar } from "../lib/VectorMath"
import { SphereFace } from "./SphereFace"

type PointOnObjectFunction = (pointOnUnitSphere: Vector3) => Vector3

type Coordinate = {
  latitude: number,
  longitude: number
}

function defaultPositionFunction(pointOnUnitSphere: Vector3): Vector3 {
  return multiplyScalar(pointOnUnitSphere, 2)
}

function pointToCoordinate(pointOnUnitSphere: Vector3): Coordinate {
  const latitude = Math.asin(pointOnUnitSphere.y)
  const longitude = Math.atan2(pointOnUnitSphere.x, -pointOnUnitSphere.z)
  return {latitude, longitude}
}

function cartesianToCoordinate(x: number, y: number): Coordinate {
  const latitude  = y * Math.PI - Math.PI/2
  const longitude = x * 2 * Math.PI - Math.PI
  return {latitude, longitude}
}

function coordinateToPoint(coordinate: Coordinate): Vector3 {
  const y = Math.sin(coordinate.latitude)
  const r = Math.cos(coordinate.latitude)
  const x = Math.sin(coordinate.longitude) * r
  const z = -Math.cos(coordinate.longitude) * r
  return new Vector3(x,y,z)
}

export class SphereMesh {
  private resolution: number
  private faces: SphereFace[] = []
  private positionFunction: PointOnObjectFunction

  constructor(scene: Scene, resolution: number = 8, positionFunction: PointOnObjectFunction = defaultPositionFunction) {
    this.positionFunction = positionFunction;
    this.resolution = resolution
    
    // const texture = new NoiseProceduralTexture('perlin', 256)
    // texture.animationSpeedFactor = 0

    //---- noise generation ----
    let size = new Vector2(256, 256)
    // let noiseData = new Uint8Array(size*size*3)
    let noiseData = new Float32Array(size.x * size.y * 4)
    let noiseTexture = new Uint8Array(size.x * size.y * 4)
    const noise = makeNoise3D(Math.random()*999)

    for(let y = 0; y < size.y; y++) {
      for(let x = 0; x < size.x; x++) {
        const pos = y*size.y+x

        const coord = cartesianToCoordinate(x / size.x, y / size.y)
        const position = coordinateToPoint(coord)

        const v = (noise(position.x * 2, position.y * 2, position.z * 2) + 1) / 2

        noiseTexture[pos*4+0] = v * 256
        noiseTexture[pos*4+1] = v * 256
        noiseTexture[pos*4+2] = v * 256
        noiseTexture[pos*4+3] = 255

        noiseData[pos*4+0] = v
        noiseData[pos*4+1] = v
        noiseData[pos*4+2] = v
        noiseData[pos*4+3] = 1
      }
    }
    
    const texture = RawTexture.CreateRGBATexture(noiseTexture, size.x, size.y, scene)

    this.faces = [
      new SphereFace(scene, new Vector3( 1,  0,  0), this, texture),
      new SphereFace(scene, new Vector3(-1,  0,  0), this, texture),
      new SphereFace(scene, new Vector3( 0,  1,  0), this, texture),
      new SphereFace(scene, new Vector3( 0, -1,  0), this, texture),
      new SphereFace(scene, new Vector3( 0,  0,  1), this, texture),
      new SphereFace(scene, new Vector3( 0,  0, -1), this, texture),
    ]

    this.generateFaces()

    // setInterval(() => {
    //   console.log('update')
    //   this.generateFaces()
    // }, 1000)
  }

  getResolution(): number { return this.resolution }
  setResolution(resolution: number): void {
    this.resolution = resolution
    this.generateFaces()
  }

  getFaces(): Mesh[] {
    return this.faces.map(face => face.getMesh())
  }

  getPointOnObject(pointOnUnitSphere: Vector3): Vector3 {
    return this.positionFunction(pointOnUnitSphere)
  }

  generateFaces(): void {
    for(let face of this.faces) {
      face.generateGeometry()
    }
  }

  dispose() {
    for(let face of this.faces) {
      face.dispose()
    }
  }
}