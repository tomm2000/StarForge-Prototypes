import { Mesh, NoiseProceduralTexture, RawTexture, Scene, Texture, Vector2, Vector3 } from "babylonjs"
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

  constructor(scene: Scene, resolution: number = 20, positionFunction: PointOnObjectFunction = defaultPositionFunction) {
    this.positionFunction = positionFunction;
    this.resolution = resolution
    
    // const texture = new NoiseProceduralTexture('perlin', 256)
    // texture.animationSpeedFactor = 0

    const texture = new Texture('http://localhost:3001/images/testcube')

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