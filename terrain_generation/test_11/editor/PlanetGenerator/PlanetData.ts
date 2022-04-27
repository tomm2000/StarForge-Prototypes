import { GUI } from "dat.gui";
import { NoiseDataJson } from "../../common/PlanetData/NoiseDataJson";
import { PlanetDataJson } from "../../common/PlanetData/PlanetDataJson";
import { download } from "../lib/downloader";
import { destroyGUIrecursive } from "../lib/GUI";
import { addNoiseLayerGui, defaultNoiseData } from "./NoiseData";



export class PlanetData {
  private data: PlanetDataJson = {
    type: 'terrestrial1',
    radius: 1,
    seed: Math.floor(Math.random() * 9999),
    noiseLayers: [],
    debugNoise: false,
    // https://nme.babylonjs.com/#XRRVZX#49
    materialId: 'XRRVZX#49',
    materialHeightMultiplier: 1,
    waterLevel: 0,
    oceanDepth: 1,
    oceanFloor: -.2
  }

  private noise_guis: GUI[] = []

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

    this.data.noiseLayers[index] = defaultNoiseData(index)

    this.updateNoiseGuis()
  }

  removeNoiseLayer(layer: NoiseDataJson): void {
    let index = this.data.noiseLayers.indexOf(layer)
    this.data.noiseLayers.splice(index, 1)

    this.updateNoiseGuis()
  }

  private updateNoiseGuis() {
    this.noise_guis.forEach(gui => destroyGUIrecursive(gui))
    this.noise_guis = [] 

    let index = 0
    for(let layer of this.data.noiseLayers) {
      const noise_gui = new GUI()
      layer.index = index

      addNoiseLayerGui(layer, noise_gui, `layer ${layer.index}`)

      const removeLayer = this.removeNoiseLayer.bind(this)

      noise_gui.add({ remove: () => {
        removeLayer(layer)
      } }, 'remove')

      this.noise_guis.push(noise_gui)

      index++
    }
  }

  generateGUI(parent_gui: GUI) {
    parent_gui.add(this.data, 'radius', 0.1, 2, 0.01)
    parent_gui.add(this.data, 'waterLevel', -1, 1, 0.01)
    parent_gui.add(this.data, 'oceanDepth', 0, 5, 0.01)
    parent_gui.add(this.data, 'oceanFloor', -1, 0, 0.01)
    parent_gui.add(this.data, 'seed', 0, 9999)
    parent_gui.add(this.data, 'materialHeightMultiplier', 0, 1, 0.01)
    parent_gui.add(this, 'addNoiseLayer')
    parent_gui.add(this, 'downloadJson')

    this.updateNoiseGuis()
  }

  downloadJson() {
    download('planet_data.json', JSON.stringify(this.getData()))
  }

  dispose() {
    this.noise_guis.forEach(gui => destroyGUIrecursive(gui))
    this.noise_guis = [] 
  }
}
