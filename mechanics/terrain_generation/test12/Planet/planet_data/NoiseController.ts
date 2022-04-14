import { GUI, GUIController } from "dat.gui";
import { destroyGUIrecursive } from "../../lib/GUI";
import { BasicNoise } from "../noise_layer/BasicNoise";
import { CraterNoise } from "../noise_layer/CraterNoise";
import { MaskNoise } from "../noise_layer/MaskNoise";
import { NoiseLayer } from "../noise_layer/NoiseLayer";
import { OceanModifier } from "../noise_layer/OceanModifier";
import { PositiveNoise } from "../noise_layer/PositiveNoise";
import { RidgeNoise } from "../noise_layer/RidgeNoise";
import { DataController } from "./DataController";

export type NoiseTypes = 'default' | 'basic' | 'positive' | 'ridge' | 'ocean_modifier' | 'mask' | 'crater';
export const NoiseTypeList: NoiseTypes[] = ['default', 'basic', 'positive', 'ridge', 'ocean_modifier', 'mask', 'crater']

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
  changedLayer: number = 0


  private data_controller: DataController
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

  getRadius() { return this.data_controller.getRadius() }

///================ CONSTRUCTORS & JSON ======================
  private constructor(data_controller: DataController) {
    this.data_controller = data_controller
  }
  
  dispose() {
    this.noiseLayers.forEach(layer => { layer.dispose() })
    destroyGUIrecursive(this.mainGUI)
  }

  /** returns an object representing the controller's data */
  getJson(): object {
    return {
      layer_amount: this.noiseLayers.length,
      layers: this.noiseLayers.map(layer => layer.getJson())
    }
  }

  static fromJson(data: object, data_controller: DataController): NoiseController {
  
    const controller = new NoiseController(data_controller);
  
    (data as any).layers.forEach((layer: any, index: any) => {
      const new_layer = NoiseLayer.fromJson(layer, (noiseEnum as any)[layer.noise_type], controller, index)
      controller.addLayer(new_layer)
    })
  
    return controller
  }

  static makeEmpty(data_controller: DataController): NoiseController {
    return new NoiseController(data_controller)
  }
///===========================================================

///======================== GUI ==============================
  /**
   * adds a layer to the list
   * @param layer the layer to add, defaults to a new default layer
   */
  private addLayer(layer: NoiseLayer | undefined) {
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

    console.log(index)

    this.noiseLayers[index].generateGui(this.layerGUI)
    this.indexGUI?.setValue(index)
  }

  /** updates the indexes for all the layers */
  private updateIndexes() {
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
  generateGUI() {
    this.mainGUI = new GUI()
    let folder = this.mainGUI.addFolder(`noise controller`)

    folder.add(this, 'addLayer')
    folder.add(this, 'removeLayer')
    this.indexGUI = folder.add(this, 'currentLayer', 0, Math.max(0, this.noiseLayers.length - 1), 1)

    this.layerGUI = this.mainGUI.addFolder('noise layer')

    this.switchLayer()
  }
  
  /** removes the gui */
  destroyGUI() { destroyGUIrecursive(this.mainGUI) }
///===========================================================

///====================== GENERATION =========================
  /** initializes the layers with the current specs or the given ones */
  private initializeLayers(gpuSpecs: GPUSpecs | undefined = this.gpuSpecs) {
    if(!gpuSpecs) { throw 'bad gpu specs' }

    this.noiseLayers.forEach(layer => {
      if(!layer.isInitialized()) {
        layer.initGPU(gpuSpecs)
      }
    })
  }

  /** sets the gpu specs that will be used by the layers */
  setGPUSpecs(specs: GPUSpecs) {
    this.gpuSpecs = specs
    this.initializeLayers(this.gpuSpecs)
  }

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
    
    for(let i = this.changedLayer; i < this.noiseLayers.length; i++) {
      const layer = this.noiseLayers[i]

      let mask_data: Float32Array | undefined = undefined

      if(layer.getMaskIndex() >= 0 && layer.getMaskIndex() < i) {
        mask_data = this.elevationDataCache[layer.getMaskIndex()]
      }

      const el_data = i == 0 ? this.baseElevationDataCache : this.elevationDataCache[i-1]
      let radius = this.data_controller.getRadius()
      let position = this.positionDataCache.slice()
      position = position.map(p => p * radius)

      this.elevationDataCache[i] = layer.applyNoise(
        el_data,
        position,
        mask_data
      )
    }

    this.changedLayer = this.noiseLayers.length
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
///===========================================================
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
  'ridge': RidgeNoise,
  'crater': CraterNoise,
}