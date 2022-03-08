import { Mesh, Vector3, ShaderMaterial, Scene, FloatArray, StandardMaterial, MeshBuilder, Material, MaterialPluginBase, Constants, RegisterMaterialPlugin, Color3, VertexBuffer, PBRMaterial, PBRBaseSimpleMaterial, PBRMetallicRoughnessMaterial, Vector2, RawTexture } from "babylonjs"
import { getDefaultPositionShader, positionShader } from "./positionShader"
import { GPGPU } from '../lib/GPGPU'
import { mapValue } from "../lib/Math"

const defaultPositionShader = getDefaultPositionShader()

export class IcoSphereMesh {
  private resolution: number = 10
  private positionShader: positionShader
  private mesh: Mesh
  private material: Material | undefined
  private scene: Scene
  private GPGPU: GPGPU | undefined
  private meshImageRoot: number | undefined
  private originalMeshData: Float32Array | undefined

  constructor(scene: Scene, resolution: number = 32, positionShader: positionShader = defaultPositionShader) {
    this.positionShader = positionShader;
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

  getPositionShader(): positionShader | undefined { return this.positionShader }
  // /** sets the new material, does NOT regenerate the mesh! */
  setPositionShader(positionShader: positionShader): void {
    this.positionShader = positionShader
  }

  /** updates the position of the points on the object, does NOT generate a new geometry (resolution changes have no effect!) */
  updateMesh(): void {
    if(!this.mesh || !this.GPGPU || !this.originalMeshData) { return }

    const GPGPU = this.GPGPU
    const originalMeshData = this.originalMeshData
    let colorData = new Float32Array(0)

    this.mesh.updateMeshPositions((data) => {
      this.positionShader.uniforms.forEach(uniform => {
        GPGPU.addUniform(uniform)
      })

      GPGPU.draw()

      const results = GPGPU.getPixels()

      colorData = new Float32Array(originalMeshData.length)

      let max_elevation = Number.MIN_VALUE
      let min_elevation = Number.MAX_VALUE
      
      for(let i = 0; i < results.length / 4; i++) {
        const elevation = results[i*4 + 3]

        data[i*3 + 0] = (originalMeshData[i*4 + 0] * 2 - 1) / elevation
        data[i*3 + 1] = (originalMeshData[i*4 + 1] * 2 - 1) / elevation
        data[i*3 + 2] = (originalMeshData[i*4 + 2] * 2 - 1) / elevation

        max_elevation = Math.max(max_elevation, 1/elevation)
        min_elevation = Math.min(min_elevation, 1/elevation)
      }

      for(let i = 0; i < results.length / 4; i++) {
        const elevation = results[i*4 + 3]

        colorData[i*4+0] = mapValue(1/elevation, min_elevation, max_elevation, 0, 1)
        colorData[i*4+1] = 0
        colorData[i*4+2] = 0
        colorData[i*4+3] = 1
      }
    }, true)

    
    this.mesh.setVerticesData('color', colorData)

  }

  /** generates a new mesh from scratch */
  generateNewMesh(): Mesh {
    const mesh = MeshBuilder.CreateIcoSphere('icosphere', {subdivisions: this.resolution, updatable: true, flat: false}, this.scene)

    this.mesh = mesh

    
    let colorData = new Float32Array(0)

    this.mesh.updateMeshPositions((data) => {
      const dataLength      = data.length / 3 * 4
      this.originalMeshData = new Float32Array(dataLength)
      colorData = new Float32Array(dataLength)

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

      this.GPGPU = new GPGPU({width: dataLength / 4 / this.meshImageRoot, height: this.meshImageRoot})

      this.GPGPU.makeFrameBuffer(dataLength / 4 / this.meshImageRoot, this.meshImageRoot)
      this.GPGPU.makeTexture(this.originalMeshData)

      this.GPGPU.buildProgram(this.positionShader.fragmentSource, this.positionShader.vertexSource)

      this.GPGPU.addAttrib("position", {numElements: 3, stride: 20, offset: 0})
      this.GPGPU.addAttrib("textureCoord", {numElements: 2, stride: 20, offset: 12})

      this.positionShader.uniforms.forEach(uniform => {
        this.GPGPU?.addUniform(uniform)
      })

      this.GPGPU.draw()

      const results = this.GPGPU.getPixels()
      let max_elevation = Number.MIN_VALUE
      let min_elevation = Number.MAX_VALUE


      for(let i = 0; i < results.length / 4; i++) {
        const elevation = results[i*4 + 3]

        data[i*3 + 0] = (this.originalMeshData[i*4 + 0] * 2 - 1) / elevation
        data[i*3 + 1] = (this.originalMeshData[i*4 + 1] * 2 - 1) / elevation
        data[i*3 + 2] = (this.originalMeshData[i*4 + 2] * 2 - 1) / elevation

        max_elevation = Math.max(max_elevation, 1/elevation)
        min_elevation = Math.min(min_elevation, 1/elevation)
      }

      for(let i = 0; i < results.length / 4; i++) {
        const elevation = results[i*4 + 3]

        colorData[i*4+0] = mapValue(1/elevation, min_elevation, max_elevation, 0, 1)
        colorData[i*4+1] = 0
        colorData[i*4+2] = 0
        colorData[i*4+3] = 1
      }
    }, true)

    const material = new StandardMaterial('material')
    this.mesh.material = material

    return this.mesh 
  }

  getMesh(): Mesh {
    return this.mesh || this.generateNewMesh()
  }

  dispose() {
    this.GPGPU?.delete()
    this.mesh.dispose()
  }
}