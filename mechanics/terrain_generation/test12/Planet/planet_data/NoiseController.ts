import { GUI, GUIController } from "dat.gui";
import { GPGPU, textureData } from "../../lib/GPGPU";
import { destroyGUIrecursive } from "../../lib/GUI";
import { BasicNoise } from "../noise_layer/BasicNoise";
import { MaskNoise } from "../noise_layer/MaskNoise";
import { NoiseLayer, NoiseLayerData } from "../noise_layer/NoiseLayer";
import { OceanModifier } from "../noise_layer/OceanModifier";
import { PositiveNoise } from "../noise_layer/PositiveNoise";
import { RidgeNoise } from "../noise_layer/RidgeNoise";

export type NoiseTypes = 'default' | 'basic' | 'positive' | 'ridge' | 'ocean_modifier' | 'mask'
export const NoiseTypeList: NoiseTypes[] = ['default', 'basic', 'positive', 'ridge', 'ocean_modifier', 'mask']

export type GPUSpecs = {
  width: number,
  height: number,
  gl?: WebGLRenderingContext
}


export class NoiseController {
  private noiseLayers: NoiseLayer[] = []

  private elevationDataCache: textureData[] = []
  private baseElevationDataCache: textureData | undefined
  private positionDataCache: textureData | undefined

  private gpuSpecs: GPUSpecs | undefined

  private _currentLayer: number = 0
  private set currentLayer(layer: number) {
    if(this._currentLayer != layer) {
      this._currentLayer = layer
      this.switchLayer()
    }
  }
  private get currentLayer() {
    return this._currentLayer
  }

  //---- GUI ----
  private mainGUI: GUI | undefined
  private indexGUI: GUIController | undefined
  private layerGUI: GUI | undefined

  private constructor() {
    this.generateGUI()
  }

  /** initializes the layers with the current specs or the given ones */
  initializeLayers(gpuSpecs: GPUSpecs | undefined = this.gpuSpecs) {
    if(!gpuSpecs) { throw 'bad gpu specs' }

    this.noiseLayers.forEach(layer => {
      if(!layer.isInitialized()) {
        layer.initGPU(gpuSpecs)
      }
    })
  }

  /**
   * adds a layer to the list
   * @param layer the layer to add, defaults to a new default layer
   */
  addLayer(layer: NoiseLayer | undefined) {
    const new_layer = layer || new NoiseLayer(this.gpuSpecs, this, this.noiseLayers.length)
    this.noiseLayers.push(new_layer)

    this.indexGUI?.max(this.noiseLayers.length - 1)

    this.updateIndexes()
    this.switchLayer(this.noiseLayers.length - 1)
  }

  /** removes the current layer from the lists, adjusts the index gui accordingly */
  private removeLayer() {
    if(this.noiseLayers.length == 0 || this.currentLayer >= this.noiseLayers.length) { return; }

    //---- the pointed layer gets removed from the array and gets disposed of ----
    this.noiseLayers[this.currentLayer].dispose(false)
    this.noiseLayers.splice(this.currentLayer, 1)

    //---- if it was the last layer in the list we point to the new last layer ----
    if(this.currentLayer >= this.noiseLayers.length) {
      this.currentLayer = Math.max(0, this.noiseLayers.length -1)
    }
    
    //---- if there are no more layers left the GUI gets cleared ----
    if(this.noiseLayers.length == 0) {
      this.clearNoiseGUI()
    }

    //---- we set the new values for the index slider ----
    this.indexGUI?.max(Math.max(0, this.noiseLayers.length-1))
    this.indexGUI?.setValue(this.currentLayer)

    //---- we clear the cache for all the layers past the one we removed
    this.elevationDataCache = this.elevationDataCache.splice(0, this.currentLayer)
    this.updateIndexes()
    this.switchLayer()
  }

  /** switches the layer gui to the current layer or the indexed one */
  private switchLayer(index: number = this.currentLayer) {
    if(!this.layerGUI || this.noiseLayers.length == 0) { return }

    this.currentLayer = index

    this.clearNoiseGUI()

    this.noiseLayers[index].generateGui(this.layerGUI)
    this.indexGUI?.setValue(index)
  }

  /** updates the indexes for all the layers */
  updateIndexes() {
    this.noiseLayers.forEach((layer, index) => layer.setIndex(index))
  }

  /** clears the gui containing the noise data */
  private clearNoiseGUI() {
    if(!this.mainGUI || !this.layerGUI) { return }

    this.mainGUI.removeFolder(this.layerGUI)
    this.layerGUI = this.mainGUI.addFolder('noise layer')
  }

  /** changes the current layer for a new one based on the given type */
  changeNoiseType(type: NoiseTypes) {
    if(!this.mainGUI || !this.layerGUI) { return }

    const layer_class: typeof NoiseLayer = noiseEnum[type]
    const new_layer = new layer_class(this.gpuSpecs, this, this.currentLayer)

    //---- switch the current noise for the new one ----
    this.noiseLayers[this.currentLayer].dispose(false)
    this.noiseLayers[this.currentLayer] = new_layer

    //---- switch the current GUI for the new one ----
    this.clearNoiseGUI()
    new_layer.generateGui(this.layerGUI)
  }

  /** generates the gui */
  generateGUI(gui: GUI = new GUI()) {
    this.mainGUI = gui

    gui.add(this, 'addLayer')
    gui.add(this, 'removeLayer')
    this.indexGUI = gui.add(this, 'currentLayer', 0, Math.max(0, this.noiseLayers.length), 1)

    this.layerGUI = gui.addFolder('noise layer')
  }

  /** sets the gpu specs that will be used by the layers */
  setGPUSpecs(specs: GPUSpecs) {
    this.gpuSpecs = specs

    
    this.gpuSpecs.gl = GPGPU.createWebglContext(specs.width, specs.height)
    this.initializeLayers(this.gpuSpecs)
  }

  /** removes the gui */
  destroyGUI() { destroyGUIrecursive(this.mainGUI) }

  //TODO: only layers after the one that got changed need to be recalculated!
  /**
   * calculates all the noise layers
   * @param elevation_data a vec4 array with (/,/,a,b), where a is the elevation of the previous layer and b the total elevation
   * @param position_data a vec4 array with (x,y,z,/), where x,y,z is a point on the sphere
   * @returns a new updated elevation_data vec4 array
   */
  applyLayers(position_data?: Float32Array, elevation_data?: Float32Array) {
    if(!this.gpuSpecs) { throw 'gpu specs not initialized' }
    this.initializeLayers()

    if(elevation_data) { this.baseElevationDataCache = new textureData({type: 'array', value: elevation_data}) }
    if(position_data)  { this.positionDataCache = new textureData({type: 'array', value: position_data }) }

    if(!this.baseElevationDataCache || !this.positionDataCache) {
      throw 'elevation and position data are not initialized nor passed!'
    }
    
    for(let i = 0; i < this.noiseLayers.length; i++) {
      const layer = this.noiseLayers[i]

      let mask_data: textureData | undefined = undefined

      if(layer.getMaskIndex() >= 0 && layer.getMaskIndex() < i) {
        mask_data = this.elevationDataCache[layer.getMaskIndex()]
      }


      const el_data = i == 0 ? this.baseElevationDataCache : this.elevationDataCache[i-1]

      this.elevationDataCache[i] = layer.applyNoise(
        this.positionDataCache,
        el_data,
        mask_data
      )
    }
  }

  /** wether the elevation and position data are initialized or not */
  isElevationDataInitialized() { return (this.baseElevationDataCache && this.positionDataCache) }

  /**
   * returns the elevation data of a given layer
   * @param index the index of the layer we want the data from, defaults to last layer
   * @returns a vec4 array with (/,/,a,b), where a is the elevation of the layer and b the total elevation
   */
  getLayerData(index: number = this.elevationDataCache.length -1): Float32Array {
    if(this.elevationDataCache.length == 0) {
      if(!this.baseElevationDataCache) { throw 'not base elevation data nor any noise layer was initialized'}

      if(this.baseElevationDataCache.val.type == 'texture') { throw 'this error should not happen'}
      
      return this.baseElevationDataCache.val.value
    } else {
      const pixels = this.noiseLayers[index].getPixels()

      if(!pixels) { throw 'noise layer not initialized'}

      return pixels
    }
  }

  dispose() {
    this.noiseLayers.forEach(layer => { layer.dispose() })
    destroyGUIrecursive(this.mainGUI)
  }

  /** returns an object representing the controller's data */
  getJson(): NoiseControllerData {
    return {
      layer_amount: this.noiseLayers.length,
      layers: this.noiseLayers.map(layer => layer.getJson())
    }
  }

  static fromJson(data: string): NoiseController {
    // console.log(data)
    const json: NoiseControllerData = JSON.parse(data)
  
    const controller = new NoiseController()
  
    json.layers.forEach((layer, index) => {
      const new_layer = NoiseLayer.fromJson(layer, noiseEnum[layer.noiseType], controller, index)
      controller.addLayer(new_layer)
    })
  
    return controller
  }

  static makeEmpty(): NoiseController {
    return new NoiseController()
  }
}

type noiseEnumType = {
  [key in NoiseTypes]: typeof NoiseLayer;
};


export const noiseEnum: noiseEnumType = {
  'basic': BasicNoise,
  'default': NoiseLayer,
  'mask': MaskNoise,
  'ocean_modifier': OceanModifier,
  'positive': PositiveNoise,
  'ridge': RidgeNoise
}

export type NoiseControllerData = {
  layer_amount: number,
  layers: NoiseLayerData[]
}