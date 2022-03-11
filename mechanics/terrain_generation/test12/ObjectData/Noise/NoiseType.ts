import { GUI } from "dat.gui";
import { getDefaultPositionShader, positionShader } from "./positionShader";
import { GPGPU, GPGPUuniform } from "../../lib/GPGPU";
import { destroyGUIrecursive } from "../../lib/GUI";
import { PlanetData } from "../PlanetData";
import { BasicNoise } from "./BasicNoise";
import { NoiseController } from "./NoiseController";

export type NoiseTypes = 'default' | 'basic'
export const NoiseTypeList: NoiseTypes[] = ['default', 'basic']

  

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
  protected controller: NoiseController
  protected gui: GUI | undefined
  protected gpuSpecs: GPUSpecs | undefined

  protected _noiseType: NoiseTypes = 'default'
  set noiseType(type: NoiseTypes) {
    this._noiseType = type
    this.controller.changeNoiseType(type)
  }
  get noiseType() {
    return this._noiseType
  } 

  constructor(gpuSpecs: GPUSpecs | undefined = undefined, controller: NoiseController, index: number) {
    this.positionShader = this.getPositionShader()
    this.controller = controller
    this.layer_index = index
    this.gpuSpecs = gpuSpecs
    if(gpuSpecs) { this.initGPU(gpuSpecs) }
  }

  initGPU({gl, height, width}: GPUSpecs) {
    if(this.gpu) { this.gpu.delete() }

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

  /**
   * Updates the texture buffers
   * @param elevation_data a vec4 array with (/,/,a,b), where a is the elevation of the previous layer and b the total elevation
   * @param position_data a vec4 array with (x,y,z,/), where x,y,z is a point on the sphere
   * @returns a new updated elevation_data vec4 array
   */
  protected updateTextures(elevation_data: Float32Array, position_data: Float32Array) {
    if(!this.gpu) { throw 'initialize gpu first' }

    if(this.texture_built) {
      this.gpu.updateTexture(position_data, 0)
      this.gpu.updateTexture(elevation_data, 1)
    } else {
      this.gpu.makeTexture(position_data)
      this.gpu.makeTexture(elevation_data)
      this.texture_built = true
    }
  }

  protected getPositionShader() {
    return getDefaultPositionShader()
  }

  /**
   * Applies the noise to the elevation_data with the given position_data
   * @param elevation_data a vec4 array with (/,/,a,b), where a is the elevation of the previous layer and b the total elevation
   * @param position_data a vec4 array with (x,y,z,/), where x,y,z is a point on the sphere
   * @returns a new updated elevation_data vec4 array
   */
  applyNoise(elevation_data: Float32Array, position_data: Float32Array): Float32Array {
    if(!this.gpu) { throw 'initialize gpu first' }
  
    this.updateTextures(elevation_data, position_data)

    for(let uniform of this.getUniforms()) {
      this.gpu.addUniform(uniform)
    }

    this.gpu.draw()

    return this.gpu.getPixels()
  }

  protected getUniforms(): GPGPUuniform[] {
    return []
  }

  generateGui(gui: GUI): GUI {
    gui.open()

    gui.add(this, 'noiseType', NoiseTypeList)

    this.gui = gui
    return gui
  }

  getGui() {
    return this.gui
  }

  dispose(destroy_gui: boolean = true) {
    this.gpu?.delete()
    if(destroy_gui) {
      destroyGUIrecursive(this.gui) 
    }
  }
}