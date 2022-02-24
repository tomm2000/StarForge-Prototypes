import { BufferAttribute, BufferGeometry, IcosahedronBufferGeometry, Mesh, MeshStandardMaterial, Vector2, Vector3 } from "three";
import { SphereMesh } from "./SphereMesh";

export class SphereFace {
  private normal: Vector3
  private parent: SphereMesh
  // private geometry: BufferGeometry = new BufferGeometry()
  private material: MeshStandardMaterial = new MeshStandardMaterial({ wireframe: true })
  private mesh: Mesh

  constructor(normal: Vector3, parent: SphereMesh) {
    this.normal = normal
    this.parent = parent
    this.mesh = new Mesh(
      new BufferGeometry(),
      this.material
    )
  }

  generateGeometry(): void {
    const geometry = new BufferGeometry()

    const { parent, normal } = this
    const resolution = parent.getResolution()

    const positionNumComponents = 3;
    // const normalNumComponents = 3;
    // const uvNumComponents = 2;

    const numVertices = resolution * resolution
    const numIndices = (resolution-1) * (resolution-1) * 6;

    const positions: number[] = []
    // const normalArray: number[] = []
    // const uvArray: number[] = []
    const indexArray: number[] = []

    let triIndex = 0

    const axisA = new Vector3(normal.y, normal.z, normal.x)
    const axisB = normal.clone().cross(axisA)

    for(let y = 0; y < resolution; y ++) {
      for(let x = 0; x < resolution; x ++) {
        const i = x + y * resolution

        const percent: Vector2 = new Vector2(x, y).divideScalar(resolution-1)

        const a = axisA.clone().multiplyScalar((percent.x - .5) * 2)
        const b = axisB.clone().multiplyScalar((percent.y - .5) * 2)
        const pointOnUnitCube: Vector3 = normal.clone().add(a).add(b)
        
        const pointOnUnitSphere = pointOnUnitCube.clone().normalize()

        // Vector3 pointOnPlanet = sphereMesh.getPointOnObject(pointOnUnitSphere);
        const pointOnObject = parent.getPointOnObject(pointOnUnitSphere)

        // float l = pointOnPlanet.Length();

        // sphereMesh.minHeight = System.Math.Min(sphereMesh.minHeight, l);
        // sphereMesh.maxHeight = System.Math.Max(sphereMesh.maxHeight, l);

        positions.push(...pointOnObject.toArray())

        if(x != resolution-1 && y != resolution-1) {
          indexArray[triIndex+0] = i;
          indexArray[triIndex+1] = i + resolution + 1;
          indexArray[triIndex+2] = i + resolution;

          indexArray[triIndex+3] = i;
          indexArray[triIndex+4] = i + 1;
          indexArray[triIndex+5] = i + resolution + 1;

          triIndex += 6;
        }
      }
    }

    geometry.deleteAttribute('position')

    geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), positionNumComponents))

    geometry.setIndex(indexArray)

    geometry.computeVertexNormals()

    // this.mesh.geometry = geometry

    // this.mesh.geometry = new IcosahedronBufferGeometry(100, 30)
  }

  getMesh(): Mesh {
    // let geom = new IcosahedronBufferGeometry(1, 5)

    // let icogeom = geom.getAttribute('position')

    // console.log(icogeom)

    // console.log(this.mesh.geometry.getAttribute('position'))

    return this.mesh
  } 

  dispose() {
    this.material.dispose()
    this.mesh.geometry.dispose()
  }
}