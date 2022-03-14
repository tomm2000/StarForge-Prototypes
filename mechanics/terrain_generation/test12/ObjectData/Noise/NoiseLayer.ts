import { GUI } from "dat.gui";
import { getDefaultPositionShader, positionShader } from "../positionShader";
import { GPGPU, GPGPUuniform } from "../../lib/GPGPU";
import { destroyGUIrecursive } from "../../lib/GUI";
import { GPUSpecs, NoiseController, NoiseTypeList, NoiseTypes } from "../NoiseController";

export class NoiseLayer {
  protected gpu: GPGPU | undefined
  protected texture_built: boolean = false
  protected initialized: boolean = false
  protected layer_index: number = 0
  protected positionShader: positionShader
  protected controller: NoiseController
  protected gui: GUI | undefined
  protected gpuSpecs: GPUSpecs | undefined

  protected maskIndex: number = -1
  protected maskOnly: boolean = false

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

  setIndex(index: number) { this.layer_index = index }
  getMaskIndex() { return this.maskIndex }

  /** sets the gpu specs for the noise layers, they will be initialized accordingly */
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
  protected updateTextures(elevation_data: Float32Array, position_data: Float32Array, mask_data?: Float32Array) {
    if(!this.gpu) { throw 'initialize gpu first' }

    if(this.texture_built) {
      this.gpu.updateTexture(position_data, 0)
      this.gpu.updateTexture(elevation_data, 1)
      if(mask_data) { this.gpu.updateTexture(mask_data, 2) }
      
    } else {
      this.gpu.makeTexture(position_data)
      this.gpu.makeTexture(elevation_data)
      this.gpu.makeTexture(mask_data || new Float32Array(0))
      this.texture_built = true
    }
  }

  protected getPositionShader() { return getDefaultPositionShader() }

  /**
   * Applies the noise to the elevation_data with the given position_data
   * @param elevation_data a vec4 array with (/,/,a,b), where a is the elevation of the previous layer and b the total elevation
   * @param position_data a vec4 array with (x,y,z,/), where x,y,z is a point on the sphere
   * @returns a new updated elevation_data vec4 array
   */
  applyNoise(elevation_data: Float32Array, position_data: Float32Array, mask_data?: Float32Array): Float32Array {
    if(!this.gpu) { throw 'initialize gpu first' }
  
    this.updateTextures(elevation_data, position_data, mask_data)

    for(let uniform of this.getUniforms()) {
      this.gpu.addUniform(uniform)
    }

    this.gpu.draw()

    return this.gpu.getPixels()
  }

  /** @returns the uniforms the shader needs */
  protected getUniforms(): GPGPUuniform[] {
    return [
      {type: 'uniform1i', name: 'is_masked', value: this.maskIndex >= 0 ? 1 : 0},
      {type: 'uniform1i', name: 'mask_only', value: this.maskOnly ? 1 : 0}
    ]
  }

  /** creates the gui for the layer */
  generateGui(gui: GUI): GUI {
    gui.open()

    gui.add(this, 'noiseType', NoiseTypeList)
    gui.add(this, 'maskIndex', -1, this.layer_index - 1, 1)
    gui.add(this, 'maskOnly')

    this.gui = gui
    return gui
  }

  getGui() { return this.gui }

  /**
   * disposes of the resouces used by the layer
   * @param destroy_gui wether to delete the gui or not
   */
  dispose(destroy_gui: boolean = true) {
    this.gpu?.delete()
    if(destroy_gui) {
      destroyGUIrecursive(this.gui) 
    }
  }

  /** @returns a json representation of the layer */
  getJson(): NoiseLayerData {
    const { noiseType, maskIndex, maskOnly } = this
    return { version: JSON_VERSION, noiseType, maskIndex, maskOnly }
  }

  /** creates a new layer with the given data */
  static fromJson(data: NoiseLayerData, layer_class: typeof NoiseLayer, controller: NoiseController, index: number): NoiseLayer {
    const layer = new layer_class(undefined, controller, index)
    for(let k in data) {
      if((layer as any)[k] && k != 'version' && k != 'noiseType') {
        (layer as any)[k] = data[k]
      }
    }
    return layer
  }
}

export interface NoiseLayerData {
  version: number,
  noiseType: NoiseTypes,
  [key: string]: any
}

const JSON_VERSION = 0.1