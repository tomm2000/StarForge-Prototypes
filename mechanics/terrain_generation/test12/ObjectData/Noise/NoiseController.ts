import { GUI, GUIController } from "dat.gui";
import { destroyGUIrecursive } from "../../lib/GUI";
import { BasicNoise } from "./BasicNoise";
import { GPUSpecs, NoiseLayer, NoiseTypes } from "./NoiseType";

export class NoiseController {
  private noiseLayers: NoiseLayer[] = []
  private elevationDataCache: Float32Array[] = []
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

  constructor() { }

  private addLayer() {
    if(!this.gpuSpecs) { throw 'gpu specs not initialized' }

    this.noiseLayers.push(new NoiseLayer(this.gpuSpecs, this, this.noiseLayers.length))

    this.indexGUI?.max(this.noiseLayers.length - 1)

    this.switchLayer(this.noiseLayers.length - 1)
  }

  private removeLayer() {
    if(this.noiseLayers.length == 0 || this.currentLayer >= this.noiseLayers.length) { return; }

    this.noiseLayers[this.currentLayer].dispose(false)
    this.noiseLayers.splice(this.currentLayer, 1)

    if(this.currentLayer >= this.noiseLayers.length) {
      this.currentLayer = Math.max(0, this.noiseLayers.length -1)
    }
    
    if(this.noiseLayers.length == 0) {
      this.clearNoiseGUI()
    }

    this.indexGUI?.max(Math.max(0, this.noiseLayers.length-1))
    this.indexGUI?.setValue(this.currentLayer)
  }

  private switchLayer(index: number = this.currentLayer) {
    if(!this.layerGUI || this.noiseLayers.length == 0) { return }

    this.clearNoiseGUI()

    this.noiseLayers[index].generateGui(this.layerGUI)
  }

  private clearNoiseGUI() {
    if(!this.mainGUI || !this.layerGUI) { return }

    this.mainGUI.removeFolder(this.layerGUI)
    this.layerGUI = this.mainGUI.addFolder('noise layer')
  }

  changeNoiseType(type: NoiseTypes) {
    if(!this.mainGUI || !this.layerGUI) { return }

    let new_layer: NoiseLayer | undefined = undefined

    if(type == 'basic') {
      new_layer = new BasicNoise(this.gpuSpecs, this, this.currentLayer)
    } else if(type == 'default') {
      new_layer = new NoiseLayer(this.gpuSpecs, this, this.currentLayer)
    } else {
      throw 'undefined noise type'
    }

    //---- switch the current noise for the new one ----
    this.noiseLayers[this.currentLayer].dispose(false)
    this.noiseLayers[this.currentLayer] = new_layer

    //---- switch the current GUI for the new one ----
    this.clearNoiseGUI()
    new_layer.generateGui(this.layerGUI)
  }

  generateGUI(gui: GUI = new GUI()) {
    this.mainGUI = gui

    gui.add(this, 'addLayer')
    gui.add(this, 'removeLayer')
    this.indexGUI = gui.add(this, 'currentLayer', 0, Math.max(0, this.noiseLayers.length), 1)

    this.layerGUI = gui.addFolder('noise layer')
  }

  setGPUSpecs(specs: GPUSpecs) { this.gpuSpecs = specs }

  //REVIEW: can be optimized to recalculate only needed layers!
  /**
   * calculates all the noise layers
   * @param elevation_data a vec4 array with (/,/,a,b), where a is the elevation of the previous layer and b the total elevation
   * @param position_data a vec4 array with (x,y,z,/), where x,y,z is a point on the sphere
   * @returns a new updated elevation_data vec4 array
   */
  applyLayers(elevation_data?: Float32Array, position_data?: Float32Array) {
    if(elevation_data) { this.elevationDataCache[0] = elevation_data }
    if(position_data) { this.positionDataCache = position_data }

    if(this.elevationDataCache.length == 0 || !this.positionDataCache) {
      throw 'elevation and position data are not initialized nor passed!'
    }
    
    for(let i = 1; i <= this.noiseLayers.length; i++) {
      const layer = this.noiseLayers[i-1]

      this.elevationDataCache[i] = layer.applyNoise(
        this.elevationDataCache[i-1],
        this.positionDataCache
      )
    }
  }

  isElevationDataInitialized() {
    return (this.elevationDataCache.length > 0 && this.positionDataCache)
  }

  /**
   * returns the elevation data of a given layer
   * @param index the index of the layer we want the data from, defaults to last layer
   * @returns a vec4 array with (/,/,a,b), where a is the elevation of the layer and b the total elevation
   */
  getLayerData(index: number = this.elevationDataCache.length -1): Float32Array {
    return this.elevationDataCache[index]
  }

  dispose() {
    this.noiseLayers.forEach(layer => { layer.dispose() })
    destroyGUIrecursive(this.mainGUI)
  }
}