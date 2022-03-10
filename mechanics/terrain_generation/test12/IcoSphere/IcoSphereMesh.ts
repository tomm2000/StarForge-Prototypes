import { Mesh, Scene, MeshBuilder, Material, } from "babylonjs"
import { GPGPU } from "../lib/GPGPU"
import { ElevationData, GPUSpecs, NoiseLayer } from '../ObjectData/Noise/NoiseType'

export class IcoSphereMesh {
  private resolution: number = 10
  private mesh: Mesh
  private material: Material | undefined
  private scene: Scene
  private meshImageRoot: number | undefined
  private originalMeshData: Float32Array | undefined
  private noise_layers: NoiseLayer[]
  private gpu_init: GPUSpecs | undefined
  minHeight: number = 0
  maxHeight: number = 0

  constructor(scene: Scene, resolution: number = 64, noise_layers: NoiseLayer[] = []) {
    this.noise_layers = noise_layers
    this.resolution = resolution
    this.scene = scene
    this.mesh = this.generateNewMesh()
  }

  getResolution(): number { return this.resolution }
  /** sets the new resolution, DOES regenerate the mesh! */
  setResolution(resolution: number): void {
    this.resolution = resolution
    this.generateNewMesh()
  }

  getMaterial(): Material | undefined { return this.material }
  // /** sets the new material, does NOT regenerate the mesh! */
  setMaterial(material: Material): void {
    this.material = material
    this.mesh.material = this.material
  }

  /** updates the position of the points on the object, does NOT generate a new geometry (resolution changes have no effect!) */
  updateMesh(): void {
    if(!this.mesh || !this.originalMeshData || !this.gpu_init) { return }

    const {originalMeshData, gpu_init } = this

    this.mesh.updateMeshPositions((data) => {

      let elevation_data: ElevationData = {
        total_layer: originalMeshData.slice(),
        first_layer: originalMeshData.slice(),
        base_layer: originalMeshData
      }

      //---- gpu initializations & application --------
      for(let layer of this.noise_layers) {
        if(!layer.isInitialized()) { layer.initGPU(gpu_init) }

        elevation_data = layer.applyNoise(elevation_data)
      }
      //-----------------------------------------------

      const results = elevation_data.total_layer

      let max_elevation = Number.MIN_VALUE
      let min_elevation = Number.MAX_VALUE

      for(let i = 0; i < results.length / 4; i++) {
        const elevation = 1 / results[i*4 + 3]

        data[i*3 + 0] = (originalMeshData[i*4 + 0] * 2 - 1) * elevation
        data[i*3 + 1] = (originalMeshData[i*4 + 1] * 2 - 1) * elevation
        data[i*3 + 2] = (originalMeshData[i*4 + 2] * 2 - 1) * elevation

        max_elevation = Math.max(max_elevation, elevation)
        min_elevation = Math.min(min_elevation, elevation)
      }

      this.minHeight = min_elevation
      this.maxHeight = max_elevation
    }, true)
  }

  /** generates a new mesh from scratch */
  generateNewMesh(): Mesh {
    const mesh = MeshBuilder.CreateIcoSphere('icosphere', {subdivisions: this.resolution, updatable: true, flat: false}, this.scene)

    this.mesh = mesh

    /* along with 'flat: false', disables low poly */
    this.mesh.forceSharedVertices()

    this.mesh.updateMeshPositions((data) => {
      const dataLength      = data.length / 3 * 4
      this.originalMeshData = new Float32Array(dataLength)

      for (let i = 0; i < data.length / 3; i++) {
        this.originalMeshData[i*4 + 0] = (data[i*3 + 0] + 1) / 2
        this.originalMeshData[i*4 + 1] = (data[i*3 + 1] + 1) / 2
        this.originalMeshData[i*4 + 2] = (data[i*3 + 2] + 1) / 2

        this.originalMeshData[i*4 + 3] = 1
      }

      if(this.meshImageRoot == undefined) {
        let size = Math.floor(Math.sqrt(dataLength / 4))
        while((dataLength / 4) %size != 0) {
          size -= 1
        }
        this.meshImageRoot = size
      }

      let elevation_data: ElevationData = {
        total_layer: this.originalMeshData.slice(),
        first_layer: this.originalMeshData.slice(),
        base_layer: this.originalMeshData
      }

      //---- gpu initializations & application --------
      const w = dataLength / 4 / this.meshImageRoot
      const h = this.meshImageRoot

      this.gpu_init = { width: w, height: h/*, gl: GPGPU.createWebglContext(w, h) */}

      for(let layer of this.noise_layers) {
        layer.initGPU(this.gpu_init)
        elevation_data = layer.applyNoise(elevation_data)
      }
      //-----------------------------------------------

      const results = elevation_data.total_layer

      let max_elevation = Number.MIN_VALUE
      let min_elevation = Number.MAX_VALUE

      for(let i = 0; i < results.length / 4; i++) {
        const elevation = 1 / results[i*4 + 3]

        data[i*3 + 0] = (this.originalMeshData[i*4 + 0] * 2 - 1) * elevation
        data[i*3 + 1] = (this.originalMeshData[i*4 + 1] * 2 - 1) * elevation
        data[i*3 + 2] = (this.originalMeshData[i*4 + 2] * 2 - 1) * elevation

        max_elevation = Math.max(max_elevation, elevation)
        min_elevation = Math.min(min_elevation, elevation)
      }

      this.minHeight = min_elevation
      this.maxHeight = max_elevation
      
    }, true)

    return this.mesh 
  }

  dispose() {
    this.mesh.dispose()
    this.noise_layers.forEach(layer => layer.dispose()) 
  }
}