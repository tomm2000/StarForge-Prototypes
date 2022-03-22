import { Mesh, Scene, MeshBuilder, Material, } from "babylonjs"
import { GPUSpecs, NoiseController } from "../Planet/planet_data/NoiseController"
import { NoiseLayer } from '../Planet/noise_layer/NoiseLayer'
import { DataController } from "../Planet/planet_data/DataController"

export class IcoSphereMesh {
  private scene: Scene
  private gpu_init: GPUSpecs | undefined

  //---- mesh
  private meshImageRoot: number | undefined
  private originalPositionData:  Float32Array | undefined
  private originalElevationData: Float32Array | undefined
  private mesh: Mesh
  private materialID: number | undefined

  //---- data
  private resolution: number = 10
  private data_controller: DataController

  constructor(scene: Scene, resolution: number = 64, data_controller: DataController) {
    this.data_controller = data_controller
    this.resolution = resolution
    this.scene = scene
    this.mesh = this.generateNewMesh()
  }

  //---- getters & setters ----
  getResolution(): number { return this.resolution }
  /** sets the new resolution, **DOES** regenerate the mesh! */
  setResolution(resolution: number): void {
    this.resolution = resolution
    this.generateNewMesh()
  }
  //---------------------------

  /** updates the position of the points on the object, does **NOT** generate a new geometry (resolution changes have no effect!) */
  updateMesh(): void {
    if(!this.mesh || !this.originalPositionData || !this.originalElevationData || !this.gpu_init) { return }

    const {originalPositionData, originalElevationData } = this

    this.mesh.updateMeshPositions((data) => {

      const noise_controller = this.data_controller.getNoiseController()

      if(noise_controller.isElevationDataInitialized()) {
        noise_controller.applyLayers()
      } else {
        noise_controller.applyLayers(
          originalElevationData.slice(),
          originalPositionData.slice() 
        )
      }

      const results = noise_controller.getLayerData()

      // console.log(results)

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

      this.data_controller.setMinMaxHeight(min_elevation, max_elevation)
    }, true)

    this.materialID = this.data_controller.getMaterialController().updateMeshMaterial(this.mesh, this.materialID)
  }

  /** generates a new mesh from scratch */
  generateNewMesh(): Mesh {
    this.mesh?.dispose()
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

    this.data_controller.getNoiseController().setGPUSpecs(this.gpu_init)
    //-----------------------------------------------

    this.updateMesh()

    return this.mesh 
  }

  dispose() {
    this.mesh.dispose()
  }
}