import { Mesh, Scene, MeshBuilder, Material, } from "babylonjs"
import { NoiseController } from "../ObjectData/Noise/NoiseController"
import { GPUSpecs, NoiseLayer } from '../ObjectData/Noise/NoiseType'

export class IcoSphereMesh {
  private resolution: number = 10
  private mesh: Mesh
  private material: Material | undefined
  private scene: Scene
  private meshImageRoot: number | undefined
  private originalPositionData:  Float32Array | undefined
  private originalElevationData: Float32Array | undefined
  private noise_controller: NoiseController
  private gpu_init: GPUSpecs | undefined
  private minHeight: number = 0
  private maxHeight: number = 0

  constructor(scene: Scene, resolution: number = 1, noise_controller: NoiseController) {
    this.noise_controller = noise_controller
    this.resolution = resolution
    this.scene = scene
    this.mesh = this.generateNewMesh()
  }

  //---- getters & setters ----
  getMinHeight() { return this.minHeight }
  getMaxHeight() { return this.maxHeight }

  getResolution(): number { return this.resolution }
  /** sets the new resolution, **DOES** regenerate the mesh! */
  setResolution(resolution: number): void {
    this.resolution = resolution
    this.generateNewMesh()
  }

  getMaterial(): Material | undefined { return this.material }
  /** sets the new material, does **NOT** regenerate the mesh! */
  setMaterial(material: Material): void {
    this.material = material
    this.mesh.material = this.material
  }
  //---------------------------

  /** updates the position of the points on the object, does **NOT** generate a new geometry (resolution changes have no effect!) */
  updateMesh(): void {
    if(!this.mesh || !this.originalPositionData || !this.originalElevationData || !this.gpu_init) { return }

    const {originalPositionData, originalElevationData } = this

    this.mesh.updateMeshPositions((data) => {

      if(this.noise_controller.isElevationDataInitialized()) {
        this.noise_controller.applyLayers()
      } else {
        this.noise_controller.applyLayers(
          originalElevationData.slice(),
          originalPositionData.slice() 
        )
      }

      const results = this.noise_controller.getLayerData()

      console.log(results)

      let max_elevation = Number.MIN_VALUE
      let min_elevation = Number.MAX_VALUE

      for(let i = 0; i < results.length / 4; i++) {
        const elevation = results[i*4 + 3]

        data[i*3 + 0] = originalPositionData[i*4 + 0] * elevation
        data[i*3 + 1] = originalPositionData[i*4 + 1] * elevation
        data[i*3 + 2] = originalPositionData[i*4 + 2] * elevation

        max_elevation = Math.max(max_elevation, elevation)
        min_elevation = Math.min(min_elevation, elevation)
      }

      this.minHeight = min_elevation
      this.maxHeight = max_elevation
    }, true)
  }

  /** generates a new mesh from scratch */
  generateNewMesh(): Mesh {
    this.mesh = MeshBuilder.CreateIcoSphere('icosphere', {subdivisions: this.resolution, updatable: true, flat: false}, this.scene)

    /* along with 'flat: false', disables low poly */
    this.mesh.forceSharedVertices()

    const data = this.mesh.getVerticesData('position')

    if(!data) { throw 'error in the mesh position data!' }

    //---- original mesh data initialization ----
    const dataLength = data.length / 3 * 4
    this.originalPositionData  = new Float32Array(dataLength)
    this.originalElevationData = new Float32Array(dataLength)

    for (let i = 0; i < data.length / 3; i++) {
      this.originalPositionData[i*4 + 0] = data[i*3 + 0]
      this.originalPositionData[i*4 + 1] = data[i*3 + 1]
      this.originalPositionData[i*4 + 2] = data[i*3 + 2]

      // this.originalPositionData[i*4 + 3] = 0


      // this.originalElevationData[i*4 + 0] = 1
      // this.originalElevationData[i*4 + 1] = 1

      this.originalElevationData[i*4 + 2] = 1
      this.originalElevationData[i*4 + 3] = 1
    }
    //-------------------------------------------

    //---- texture size calculation (closest dimension to a perfect square) ----
    let size = Math.floor(Math.sqrt(dataLength / 4))
    while((dataLength / 4) %size != 0) { size -= 1 }
    this.meshImageRoot = size
    //--------------------------------------------------------------------------

    //---- gpu initializations & application --------
    //REVIEW: find a way to use a single webgl context
    this.gpu_init = {
      width: dataLength / 4 / this.meshImageRoot,
      height: this.meshImageRoot,
      /*, gl: GPGPU.createWebglContext(w, h) */
    }

    this.noise_controller.setGPUSpecs(this.gpu_init)
    //-----------------------------------------------

    this.updateMesh()

    return this.mesh 
  }

  dispose() {
    this.mesh.dispose()
    this.noise_controller.dispose()
  }
}