import THREE, { BufferAttribute, IcosahedronBufferGeometry, Mesh, MeshStandardMaterial, Vector3 } from "three"
import { lerp } from "three/src/math/MathUtils"
import { PlanetData } from "../ObjectData/PlanetData"

type PointOnObjectFunction = (pointOnUnitSphere: Vector3) => Vector3

function defaultPositionFunction(pointOnUnitSphere: Vector3): Vector3 {
  return pointOnUnitSphere.clone().multiplyScalar(100)
}

export class IcoSphereMesh {
  private resolution: number = 10
  private positionFunction: PointOnObjectFunction
  private mesh: Mesh = new Mesh()
  private material: MeshStandardMaterial = new MeshStandardMaterial()
  private geometry: IcosahedronBufferGeometry = new IcosahedronBufferGeometry()

  constructor(resolution: number = 10, positionFunction: PointOnObjectFunction = defaultPositionFunction) {
    this.positionFunction = positionFunction;
    this.resolution = resolution

    this.mesh.geometry = this.geometry
    this.mesh.material = this.material

    this.generateNewMesh()
  }

  getResolution(): number { return this.resolution }
  /** sets the new resolution, DOES regenerate the mesh! */
  setResolution(resolution: number): void {
    this.resolution = resolution
    this.generateNewMesh()
  }

  getMaterial(): MeshStandardMaterial { return this.material }
  /** sets the new material, does NOT regenerate the mesh! */
  setMaterial(material: MeshStandardMaterial): void { this.material = material }

  getPointOnObject(pointOnUnitSphere: Vector3): Vector3 {
    return this.positionFunction(pointOnUnitSphere)
  }

  /** updates the position of the points on the object, does NOT generate a new geometry (resolution changes have no effect!) */
  updateMesh(): void {

    let positions = this.geometry.getAttribute('position') as BufferAttribute

    let t1 = 0
    let t2 = 0

    for(let i = 0; i < positions.array.length; i+=3) {
      let start = performance.now()

      const pointOnUnitSphere = new Vector3().fromArray(positions.array, i).normalize()

      t1 += performance.now() - start



      start = performance.now()

      const pointOnObject = this.getPointOnObject(pointOnUnitSphere)
      pointOnObject.toArray(positions.array, i)

      t2 += performance.now() - start
    }

    // console.log('t1: ', t1)
    // console.log('t2: ', t2)

    positions.needsUpdate = true

    this.mesh.geometry = this.geometry

    let start = performance.now()
    this.mesh.geometry.computeVertexNormals()
    // console.log('normals: ', performance.now() - start)
  }

  /** generates a new mesh from scratch */
  generateNewMesh(): void {
    this.geometry.dispose()

    this.geometry = new IcosahedronBufferGeometry(1, this.resolution)

    let positions = this.geometry.getAttribute('position') as BufferAttribute

    for(let i = 0; i < positions.array.length; i+=3) {
      const pointOnUnitSphere = new Vector3().fromArray(positions.array, i)
      
      const pointOnObject = this.getPointOnObject(pointOnUnitSphere.clone())
      pointOnObject.toArray(positions.array, i)
    }

    this.mesh.geometry = this.geometry
    this.mesh.geometry.computeVertexNormals()
  }

  getMesh(): Mesh {
    return this.mesh
  }

  dispose() {
    
  }
}