import { GUI } from "dat.gui";
import { getDefaultPositionShader, positionShader } from "./positionShader";
import { GPGPU, GPGPUuniform } from "../../lib/GPGPU";
import { destroyGUIrecursive } from "../../lib/GUI";
import { PlanetData } from "../PlanetData";
import { BasicNoise } from "./BasicNoise";

export type NoiseTypes = 'default' | 'basic'
export const NoiseTypeList: NoiseTypes[] = ['default', 'basic']

export type ElevationData = {
  total_layer: Float32Array,
  first_layer: Float32Array,
  base_layer: Float32Array,
}

export type GPUSpecs = {
  width: number,
  height: number,
  gl?: WebGLRenderingContext
}

export class NoiseLayer {
  protected gpu: GPGPU | undefined
  protected texture_built: boolean = false
  protected initialized: boolean = false
  protected layer_index: number = 0
  protected positionShader: positionShader
  protected parent: PlanetData
  protected gui: GUI | undefined
  protected gpuSpecs: GPUSpecs | undefined

  protected _noiseType: NoiseTypes = 'default'
  set noiseType(type: NoiseTypes) {
    this._noiseType = type
    this.parent.changeNoiseLayer(type, this)
  }
  get noiseType() {
    return this._noiseType
  } 

  constructor(gpuSpecs: GPUSpecs | undefined = undefined, parent: PlanetData, index: number) {
    if(gpuSpecs) { this.initGPU(gpuSpecs) }
    this.positionShader = this.getPositionShader()
    this.parent = parent
    this.layer_index = index
    this.gpuSpecs = gpuSpecs
  }

  initGPU({gl, height, width}: GPUSpecs) {
    const gpu = new GPGPU({gl, height, width})
    gpu.makeFrameBuffer(width, height)
    gpu.buildProgram(this.positionShader.fragmentSource, this.positionShader.vertexSource)

    gpu.addAttrib("position", {numElements: 3, stride: 20, offset: 0})
    gpu.addAttrib("textureCoord", {numElements: 2, stride: 20, offset: 12})

    this.gpu = gpu
    this.initialized = true
    this.gpuSpecs = {gl, height, width}
  }

  isInitialized() { return this.initialized }

  protected updateTextures(elevation_data: ElevationData) {
    if(!this.gpu) { throw 'initialize gpu first' }

    if(this.texture_built) {
      this.gpu.updateTexture(elevation_data.base_layer, 0)
      this.gpu.updateTexture(elevation_data.total_layer, 1)
      this.gpu.updateTexture(elevation_data.first_layer, 2)
    } else {
      this.gpu.makeTexture(elevation_data.base_layer)
      this.gpu.makeTexture(elevation_data.total_layer)
      this.gpu.makeTexture(elevation_data.first_layer)
      this.texture_built = true
    }
  }

  protected getPositionShader() {
    return getDefaultPositionShader()
  }

  applyNoise(elevation_data: ElevationData): ElevationData {
    if(!this.gpu) { throw 'initialize gpu first' }
  
    this.updateTextures(elevation_data)

    for(let uniform of this.getUniforms()) {
      this.gpu.addUniform(uniform)
    }

    this.gpu.draw()

    const result = this.gpu.getPixels()

    elevation_data.total_layer = result

    if(this.layer_index == 0) { elevation_data.first_layer = result }

    return elevation_data
  }

  protected getUniforms(): GPGPUuniform[] {
    return []
  }

  generateGui(gui: GUI = new GUI()): GUI {
    gui = gui.addFolder('noise data')
    gui.open()

    gui.add(this, 'noiseType', NoiseTypeList)
    gui.add(this, 'remove')

    this.gui = gui
    return gui
  }

  getGui() {
    return this.gui
  }

  remove() {
    let index = this.parent.noiseLayers.indexOf(this)

    this.parent.noiseLayers.splice(index, 1)

    this.dispose()
  }

  dispose(destroy_gui: boolean = true) {
    this.gpu?.delete()
    if(destroy_gui) {
      destroyGUIrecursive(this.gui) 
    }
  }
}