import { GUI } from "dat.gui";
import { download } from "../lib/downloader";
import { addNoiseLayerGui, defaultNoiseData, NoiseDataJson } from "./NoiseData";

export type PlanetTypes = 'terrestrial1'

export const planetTypeList: PlanetTypes[] = ['terrestrial1']

export type PlanetDataJson = {
  type: PlanetTypes
  radius: number
  globalMinHeight: number
  seed: number
  noiseLayers: NoiseDataJson[]
  debugNoise: boolean
  materialId: string
  materialHeightMultiplier: number
}

export class PlanetData {
  private data: PlanetDataJson = {
    type: 'terrestrial1',
    radius: 1,
    globalMinHeight: 0,
    seed: Math.floor(Math.random() * 9999),
    noiseLayers: [],
    debugNoise: false,
    // https://nme.babylonjs.com/#XRRVZX#49
    materialId: 'XRRVZX#49',
    materialHeightMultiplier: 1,
  }

  private gui: GUI | undefined
  private noise_folder: GUI | undefined

  constructor(data: PlanetDataJson | undefined = undefined) {
    if(data) {
      this.data = data
    }
  }

  getData() { return this.data }
  setData(data: PlanetDataJson) {
    this.data = data
  }

  addNoiseLayer(): void {
    let index = this.data.noiseLayers.length

    this.data.noiseLayers.push(defaultNoiseData(index))

    this.updateNoiseFolder()
  }

  removeNoiseLayer(layer: NoiseDataJson): void {
    // console.log(index)
    let index = this.data.noiseLayers.indexOf(layer)
    this.data.noiseLayers.splice(index, 1)

    this.updateNoiseFolder()
  }

  private updateNoiseFolder() {
    if(!this.gui) { return }
    if(this.noise_folder) { this.gui.removeFolder(this.noise_folder) }
    
    this.noise_folder = this.gui.addFolder('noise layers')
    this.noise_folder.add(this.data, 'debugNoise')

    for(let layer of this.data.noiseLayers) {
      let layer_folder = addNoiseLayerGui(layer, this.noise_folder, `layer [${layer.index}]`)

      const removeLayer = this.removeNoiseLayer.bind(this)

      layer_folder.add({ remove: () => {
        removeLayer(layer)
      } }, 'remove')
    }
  }

  generateGuiFolder(gui: GUI) {
    this.gui = gui

    const folder = gui.addFolder('planet data')
    folder.add(this.data, 'radius', 0.1, 2, 0.01)
    // folder.add(this, 'globalMinHeight', -1, 1, 0.001)
    folder.add(this.data, 'seed', 0, 9999)
    folder.add(this.data, 'materialHeightMultiplier', 0, 1, 0.01)
    folder.add(this, 'addNoiseLayer')

    this.updateNoiseFolder()
  }

  downloadJson() {
    download('planet_data.json', JSON.stringify(this.getData()))
  }
}
