import {  Mesh, NoiseProceduralTexture, Scene, ShaderMaterial, StandardMaterial, Texture, Vector2, Vector3, VertexData } from "babylonjs";
import { divideScalar, multiplyScalar } from "../lib/VectorMath";
import { pointOnCubeToUv } from "./CubeTexture";
import { SphereMesh } from "./SphereMesh";

export class SphereFace {
  private normal: Vector3
  private parent: SphereMesh
  // private geometry: BufferGeometry = new BufferGeometry()
  private mesh: Mesh
  private scene: Scene
  private texture: Texture

  constructor(scene: Scene, normal: Vector3, parent: SphereMesh, texture: Texture) {
    this.normal = normal
    this.parent = parent
    this.mesh = new Mesh('mesh', scene)
    this.scene = scene
    this.texture = texture
  }

  generateGeometry(): void {
    const { parent, normal } = this
    const resolution = parent.getResolution()

    const positionNumComponents = 3;
    // const normalNumComponents = 3;
    // const uvNumComponents = 2;

    const numVertices = resolution * resolution
    const numIndices = (resolution-1) * (resolution-1) * 6;

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


        // x = x * Math.sqrt(1 - (y*y/2) - (z*z/2) + (y*y*z*z/3))
        // y = y * Math.sqrt(1 - (z*z/2) - (x*x/2) + (z*z*x*x/3))
        // z = z * Math.sqrt(1 - (x*x/2) - (y*y/2) + (x*x*y*y/3))

        const pointOnUnitSphere = new Vector3(px,py,pz)
        // const pointOnUnitSphere = pointOnUnitCube.clone().normalize()
        // const pointOnUnitSphere = pointOnUnitCube

        positions.push(...pointOnUnitSphere.asArray())
        uvArray.push(...pointOnCubeToUv(pointOnUnitCube, normal).asArray())

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

    
    const material = new StandardMaterial('material')
    // material.wireframe = true
    material.diffuseTexture = this.texture
    this.mesh.material = material
  }

  getMesh(): Mesh {

    return this.mesh
  } 

  dispose() {
    this.mesh.dispose()
  }
}