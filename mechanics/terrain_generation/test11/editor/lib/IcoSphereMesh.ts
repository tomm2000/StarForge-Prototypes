import { Mesh, Vector3, ShaderMaterial, Scene, FloatArray, StandardMaterial, MeshBuilder, Material, MaterialPluginBase, Constants, RegisterMaterialPlugin, Color3, VertexBuffer, PBRMaterial, PBRBaseSimpleMaterial, PBRMetallicRoughnessMaterial, Vector2, RawTexture, NodeMaterial, InputBlock } from "babylonjs"
import { getDefaultPositionShader, positionShader, positionUniform } from "../../common/IcoSphere/positionShader"
import { GPGPU } from '../../common/lib/GPGPU'
import { mapValue } from "../../common/lib/Math"

export class IcoSphereMesh {
  //---- mesh --------------
  private resolution: number
  private mesh: Mesh | undefined
  private meshTextureDimension: number | undefined
  private originalMeshData: Float32Array | undefined
  private material: Material | undefined

  //---- misc --------------
  private scene: Scene
  private GPGPU: GPGPU | undefined
  private minHeight: number = 0
  private maxHeight: number = 0

  //---- position shader ----
  private positionUniforms: positionUniform[] | undefined
  private positionShader  : positionShader    | undefined

  constructor(
    scene: Scene,
    resolution: number = 64,
    positionShader: positionShader | undefined = undefined,
    positionUniforms: positionUniform[] | undefined = undefined,
    material: Material | undefined = undefined
  ) {
    this.resolution = resolution
    this.scene = scene
    this.positionShader = positionShader
    this.positionUniforms = positionUniforms
    this.material = material
  }

  //---- SETGET ---------------------------------------------
  getResolution(): number { return this.resolution }
  setResolution(resolution: number): void { this.resolution = resolution }

  getMaterial(): Material | undefined { return this.material }
  setMaterial(material: Material): void {
    if(!this.mesh) { return }
    this.material = material
    this.mesh.material = this.material
  }

  getPositionShader(): positionShader | undefined { return this.positionShader }
  setPositionShader(positionShader: positionShader): void {
    this.positionShader = positionShader
    this.GPGPU?.buildProgram(positionShader.fragmentSource, positionShader.vertexSource)
  }

  getPositionUniforms(): positionUniform[] | undefined { return this.positionUniforms }
  setPositionUniforms(uniforms: positionUniform[]): void { this.positionUniforms = uniforms }

  getMinHeight(): number { return this.minHeight }
  getMaxHeight(): number { return this.maxHeight }
  //----------------------------------------------------------

  //---- mesh generation -------------------------------------
  /** updates the position of the points on the object, does NOT generate a new geometry (resolution changes have no effect!) */
  updateMesh(): void {
    if(
      !this.mesh ||
      !this.GPGPU ||
      !this.originalMeshData ||
      !this.positionShader ||
      !this.positionUniforms
    ) { return }

    const { positionShader, positionUniforms, originalMeshData, GPGPU } = this

    this.mesh.updateMeshPositions((data) => {
      positionUniforms.forEach(uniform => {
        GPGPU.addUniform(uniform)
      })

      GPGPU.draw()

      const results = GPGPU.getPixels()

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
      
      this.minHeight = min_elevation
      this.maxHeight = max_elevation

    }, true)
  }

  /** generates a new mesh from scratch */
  generateNewMesh(): Mesh {
    if(
      !this.positionShader ||
      !this.positionUniforms
    ) { throw 'missing values in ico sphere mesh!' }

    const { positionShader, positionUniforms, resolution, scene } = this

    this.mesh = MeshBuilder.CreateIcoSphere('icosphere', {subdivisions: resolution, updatable: true, flat: false}, scene)

    /* along with 'flat: false', disables low poly */
    this.mesh.forceSharedVertices()

    this.mesh.updateMeshPositions((data) => {
      //* data initialization
      const dataLength      = data.length / 3 * 4 // length of the array from vec3 to vec4
      this.originalMeshData = new Float32Array(dataLength)

      //* we save the original data
      for (let i = 0; i < data.length / 3; i++) {
        this.originalMeshData[i*4 + 0] = (data[i*3 + 0] + 1) / 2
        this.originalMeshData[i*4 + 1] = (data[i*3 + 1] + 1) / 2
        this.originalMeshData[i*4 + 2] = (data[i*3 + 2] + 1) / 2

        this.originalMeshData[i*4 + 3] = 1
      }

      //* we calculate the optimal size for the compute texture
      if(this.meshTextureDimension == undefined) {
        let size = Math.floor(Math.sqrt(dataLength / 4))
        while((dataLength / 4) %size != 0) {
          size -= 1
        }
        this.meshTextureDimension = size
      }

      //* GPGPU stuff
      this.GPGPU = new GPGPU({width: dataLength / 4 / this.meshTextureDimension, height: this.meshTextureDimension})

      this.GPGPU.makeFrameBuffer(dataLength / 4 / this.meshTextureDimension, this.meshTextureDimension)
      this.GPGPU.makeTexture(this.originalMeshData)

      this.GPGPU.buildProgram(positionShader.fragmentSource, positionShader.vertexSource)

      this.GPGPU.addAttrib("position", {numElements: 3, stride: 20, offset: 0})
      this.GPGPU.addAttrib("textureCoord", {numElements: 2, stride: 20, offset: 12})

      positionUniforms.forEach(uniform => { this.GPGPU?.addUniform(uniform) })

      this.GPGPU.draw()

      //* result processing
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

      this.minHeight = min_elevation
      this.maxHeight = max_elevation
      
    }, true)


    return this.mesh 
  }

  dispose() {
    this.GPGPU?.delete()
    this.mesh?.dispose()
  }
}