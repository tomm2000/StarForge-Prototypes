import {  Material, Mesh, Node, NoiseProceduralTexture, Scene, ShaderMaterial, StandardMaterial, Texture, TransformNode, Vector2, Vector3, VertexData } from "babylonjs";
import { divideScalar, multiplyScalar } from "../lib/VectorMath";
import { cubeToUv } from "./CubeTexture";
import { SphereMesh } from "./SphereMesh";

export class SphereFace {
  private normal: Vector3
  private parent: SphereMesh
  private mesh: Mesh
  private scene: Scene
  private material: Material
  private resolution: number

  constructor(scene: Scene, normal: Vector3, parent: SphereMesh, material: Material, resolution: number) {
    this.normal = normal
    this.parent = parent
    this.mesh = new Mesh('mesh', scene)
    this.scene = scene
    this.material = material
    this.resolution = resolution
  }

  generateGeometry(): void {
    const { normal, resolution } = this

    const positions: number[] = []
    // const normalArray: number[] = []
    const uvArray: number[] = []
    const indices : number[] = []

    let triIndex = 0

    const axisA = new Vector3(normal.y, normal.z, normal.x)
    const axisB = normal.clone().cross(axisA)

    for(let y = 0; y < resolution; y ++) {
      for(let x = 0; x < resolution; x ++) {
        const i = x + y * resolution


        const percent = divideScalar(new Vector2(x,y), resolution-1)

        const a  = multiplyScalar(axisA, (percent.x - .5) * 2)
        const b  = multiplyScalar(axisB, (percent.y - .5) * 2)

        const pointOnUnitCube: Vector3 = normal.clone().add(a).add(b)
        // console.log(pointOnUnitCube.asArray())
        
        // let {x, y, z} = pointOnUnitCube

        const x2 = pointOnUnitCube.x*pointOnUnitCube.x
        const y2 = pointOnUnitCube.y*pointOnUnitCube.y
        const z2 = pointOnUnitCube.z*pointOnUnitCube.z

        const px = pointOnUnitCube.x * Math.sqrt(1 - (y2+z2) / 2 + (y2 * z2) / 3)
        const py = pointOnUnitCube.y * Math.sqrt(1 - (z2+x2) / 2 + (z2 * x2) / 3)
        const pz = pointOnUnitCube.z * Math.sqrt(1 - (x2+y2) / 2 + (x2 * y2) / 3)

        const pointOnUnitSphere = new Vector3(px,py,pz)
        // const pointOnUnitSphere = pointOnUnitCube.clone().normalize()
        // const pointOnUnitSphere = pointOnUnitCube

        const pointOnObject = this.parent.getPointOnObject(pointOnUnitSphere)

        positions.push(...pointOnObject.asArray())
        uvArray.push(...cubeToUv(pointOnUnitCube, normal).asArray())

        if(x != resolution-1 && y != resolution-1) {
          indices[triIndex+2] = i;
          indices[triIndex+1] = i + resolution + 1;
          indices[triIndex+0] = i + resolution;

          indices[triIndex+5] = i;
          indices[triIndex+4] = i + 1;
          indices[triIndex+3] = i + resolution + 1;

          triIndex += 6;
        }
      }
    }

    const vertexData = new VertexData()

    vertexData.positions = positions
    vertexData.indices = indices
    vertexData.uvs = uvArray

    vertexData.applyToMesh(this.mesh)

    this.mesh.material = this.material
    this.mesh.parent = this.parent.getOriginNode()
  }

  getMesh(): Mesh {
    return this.mesh
  } 

  dispose() {
    this.mesh.dispose()
  }
}