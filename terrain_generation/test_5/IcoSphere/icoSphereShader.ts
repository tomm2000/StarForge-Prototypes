import THREE, { BufferAttribute, IcosahedronBufferGeometry, Material, Mesh, MeshStandardMaterial, ShaderMaterial, SphereGeometry, Vector3 } from "three"
import { lerp } from "three/src/math/MathUtils"
import { PlanetData } from "../ObjectData/PlanetData"

type PointOnObjectFunction = (pointOnUnitSphere: Vector3) => Vector3

function defaultPositionFunction(pointOnUnitSphere: Vector3): Vector3 {
  return pointOnUnitSphere.clone().multiplyScalar(100)
}

export class IcoSphereShader {
  private resolution: number = 10
  private mesh: Mesh = new Mesh()
  private material: Material = new ShaderMaterial()
  private geometry: IcosahedronBufferGeometry = new IcosahedronBufferGeometry()

  constructor(resolution: number = 10) {
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

  /** updates the position of the points on the object, does NOT generate a new geometry (resolution changes have no effect!) */
  updateMesh(): void {
    let start = performance.now()
    this.material.dispose()

    let VS = /*glsl*/`
      varying vec3 vNormal;

      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position*100.0, 1.0);
        vNormal = normal;
      }
    `

    let FS = /*glsl*/`
    varying mediump vec3 vNormal;

    void main() {
      vec3 light = vec3(0.5, 0.2, 1.0);

      // ensure it's normalized
      light = normalize(light);

      // calculate the dot product of
      // the light to the vertex normal
      float dProd = max(0.0, dot(vNormal, light));

      // feed into our frag colour
      gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
    }
    `

    // this.material.n

    this.mesh.material = this.material
    this.mesh.geometry.computeVertexNormals()
    console.log('elapsed: ', performance.now() - start)
  }

  /** generates a new mesh from scratch */
  generateNewMesh(): void {
    this.geometry.dispose()

    this.geometry = new IcosahedronBufferGeometry(1, this.resolution)


    this.mesh.geometry = this.geometry

    this.updateMesh()

    this.mesh.geometry.computeVertexNormals()
  }

  getMesh(): Mesh {
    return this.mesh
  }

  dispose() {
    
  }
}