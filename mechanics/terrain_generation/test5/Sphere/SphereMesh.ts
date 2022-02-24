import { Mesh, Vector3 } from "three"
import { SphereFace } from "./SphereFace"

type PointOnObjectFunction = (pointOnUnitSphere: Vector3) => Vector3

function defaultPositionFunction(pointOnUnitSphere: Vector3): Vector3 {
  return pointOnUnitSphere.clone().multiplyScalar(100)
}

export class SphereMesh {
  private resolution: number = 32
  private faces: SphereFace[] = []
  private positionFunction: PointOnObjectFunction

  constructor(resolution: number = 32, positionFunction: PointOnObjectFunction = defaultPositionFunction) {
    this.positionFunction = positionFunction;
    this.resolution = resolution

    this.faces = [
      new SphereFace(new Vector3( 1,  0,  0), this),
      new SphereFace(new Vector3(-1,  0,  0), this),
      new SphereFace(new Vector3( 0,  1,  0), this),
      new SphereFace(new Vector3( 0, -1,  0), this),
      new SphereFace(new Vector3( 0,  0,  1), this),
      new SphereFace(new Vector3( 0,  0, -1), this),
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