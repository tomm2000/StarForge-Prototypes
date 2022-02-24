import { Vector3, Mesh, MeshBuilder, StandardMaterial, Scene, Color3, ShaderMaterial } from "babylonjs";

export class IcoSphereMesh {
  private resolution: number = 10
  private mesh: Mesh | undefined
  private scene: Scene
  private material: ShaderMaterial | undefined
  private position: Vector3

  constructor(scene:Scene, resolution: number = 4, position: Vector3) {
    this.position = position
    this.resolution = resolution
    this.scene = scene

    // this.mesh = MeshBuilder.CreateIcoSphere('icosphere1', {subdivisions: 2, updatable: true}, scene)

    this.generateNewMesh()
  }

  getResolution(): number { return this.resolution }
  /** sets the new resolution, DOES regenerate the mesh! */
  setResolution(resolution: number): void {
    this.resolution = resolution
    this.generateNewMesh()
  }

  getMaterial(): ShaderMaterial | undefined { return this.material }
  // /** sets the new material, does NOT regenerate the mesh! */
  setMaterial(material: ShaderMaterial): void {
    // this.material?.dispose()

    this.material = material
    
    if(this.mesh) {
      this.mesh.material = this.material
    }

    // this.updateMesh()
  }

  /** updates the position of the points on the object, does NOT generate a new geometry (resolution changes have no effect!) */
  updateMesh(): void {
    //TODO: update
  }

  /** generates a new mesh from scratch */
  generateNewMesh(): Mesh {
    this.mesh?.dispose()

    let mesh = Mesh.CreateIcoSphere('icosphere', {subdivisions: this.resolution, updatable: true}, this.scene)

    if(this.material) {
      mesh.material = this.material
    }

    this.mesh = mesh

    this.mesh.position = this.position

    return mesh
  }

  getMesh(): Mesh {
    if(this.mesh){
      return this.mesh
    } else {
      return this.generateNewMesh()
    }
  }

  dispose() {
    this.mesh?.dispose()
    this.material?.dispose()
  }
}