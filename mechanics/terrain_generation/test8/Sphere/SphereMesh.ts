import {  MeshBuilder ,Mesh, NoiseProceduralTexture, RawTexture, Scene, StandardMaterial, Texture, Vector2, Vector3, Node, TransformNode, Material } from "babylonjs"
import { makeNoise3D } from "open-simplex-noise"
import { multiplyScalar, v2String, v3String } from "../lib/VectorMath"
import { uvToCube } from "./CubeTexture"
import { SphereFace } from "./SphereFace"

type PointOnObjectFunction = (pointOnUnitSphere: Vector3) => Vector3


function defaultPositionFunction(pointOnUnitSphere: Vector3): Vector3 {
  return multiplyScalar(pointOnUnitSphere, 1)
}

export class SphereMesh {
  private resolution: number
  private faces: SphereFace[] = []
  private positionFunction: PointOnObjectFunction
  private origin: TransformNode
  private material: Material

  constructor(
    scene: Scene,
    resolution: number = 64,
    originPosition: Vector3 = Vector3.Zero(),
    positionFunction: PointOnObjectFunction = defaultPositionFunction,
    material: Material = new StandardMaterial('mat')
  ) {

    this.positionFunction = positionFunction;
    this.resolution = resolution
    this.origin = new TransformNode('origin')
    this.origin.position = originPosition
    this.material = material

    this.faces = [
      new SphereFace(scene, new Vector3( 1,  0,  0), this, this.material, this.resolution), // face 0
      new SphereFace(scene, new Vector3(-1,  0,  0), this, this.material, this.resolution), // face 2
      new SphereFace(scene, new Vector3( 0,  1,  0), this, this.material, this.resolution), // face 4
      new SphereFace(scene, new Vector3( 0, -1,  0), this, this.material, this.resolution), // face 5
      new SphereFace(scene, new Vector3( 0,  0,  1), this, this.material, this.resolution), // face 1
      new SphereFace(scene, new Vector3( 0,  0, -1), this, this.material, this.resolution), // face 3
    ]

    this.generateFaces()
  }

  getOriginNode() {
    return this.origin
  }

  getMaterial(): Material {
    return this.material
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