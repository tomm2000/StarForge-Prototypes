import { GUI, GUIController } from "dat.gui";
import { destroyGUIrecursive } from "../lib/GUI";
import { BasicNoise } from "./Noise/BasicNoise";
import { MaskNoise } from "./Noise/MaskNoise";
import { NoiseLayer, NoiseLayerData } from "./Noise/NoiseLayer";
import { OceanModifier } from "./Noise/OceanModifier";
import { PositiveNoise } from "./Noise/PositiveNoise";
import { RidgeNoise } from "./Noise/RidgeNoise";

export type NoiseTypes = 'default' | 'basic' | 'positive' | 'ridge' | 'ocean_modifier' | 'mask'
export const NoiseTypeList: NoiseTypes[] = ['default', 'basic', 'positive', 'ridge', 'ocean_modifier', 'mask']

export type GPUSpecs = {
  width: number,
  height: number,
  gl?: WebGLRenderingContext
}

export class NoiseController {
  private noiseLayers: NoiseLayer[] = []

  private elevationDataCache: Float32Array[] = []
  private baseElevationDataCache: Float32Array | undefined
  private positionDataCache: Float32Array | undefined

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

  constructor() {
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

    const layer_class: typeof NoiseLayer = noiseLayerFromType(type)
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
  applyLayers(elevation_data?: Float32Array, position_data?: Float32Array) {
    if(!this.gpuSpecs) { throw 'gpu specs not initialized' }
    this.initializeLayers()

    if(elevation_data) { this.baseElevationDataCache = elevation_data }
    if(position_data)  { this.positionDataCache      = position_data  }

    if(!this.baseElevationDataCache || !this.positionDataCache) {
      throw 'elevation and position data are not initialized nor passed!'
    }
    
    for(let i = 0; i < this.noiseLayers.length; i++) {
      const layer = this.noiseLayers[i]

      let mask_data: Float32Array | undefined = undefined

      if(layer.getMaskIndex() >= 0 && layer.getMaskIndex() < i) {
        mask_data = this.elevationDataCache[layer.getMaskIndex()]
      }

      const el_data = i == 0 ? this.baseElevationDataCache : this.elevationDataCache[i-1]

      this.elevationDataCache[i] = layer.applyNoise(
        el_data,
        this.positionDataCache,
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
      
      return this.baseElevationDataCache
    } else {
      return this.elevationDataCache[index]
    }
  }

  dispose() {
    this.noiseLayers.forEach(layer => { layer.dispose() })
    destroyGUIrecursive(this.mainGUI)
  }

  /** returns an object representing the controller's data */
  getJson(): NoiseControllerData {
    return {
      version: JSON_VERSION,
      layer_amount: this.noiseLayers.length,
      layers: this.noiseLayers.map(layer => layer.getJson())
    }
  }
}

const JSON_VERSION = 0.1

/** returns the class corresponding to the noise type */
export function noiseLayerFromType(type: NoiseTypes): typeof NoiseLayer {
  switch(type) {
    case 'basic': return BasicNoise
    case 'default': return NoiseLayer
    case 'positive': return PositiveNoise
    case 'ridge': return RidgeNoise
    case 'ocean_modifier': return OceanModifier
    case 'mask': return MaskNoise
    default: throw 'undefined noise type'
  }
}

export type NoiseControllerData = {
  version: number,
  layer_amount: number,
  layers: NoiseLayerData[]
}

export function noiseControllerFromJson(data: NoiseControllerData) {
  if(data.version != JSON_VERSION) { throw 'wrong json version for controller'}

  const controller = new NoiseController()

  data.layers.forEach((layer, index) => {
    const new_layer = NoiseLayer.fromJson(layer, noiseLayerFromType(layer.noiseType), controller, index)
    controller.addLayer(new_layer)
  })

  return controller
}