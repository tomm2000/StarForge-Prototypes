import { GUI } from "dat.gui";
import { NoiseData, NoiseDataJson } from "./NoiseData";

export type PlanetTypes = 'terrestrial1'

export const planetTypeList: PlanetTypes[] = ['terrestrial1']

type PlanetDataJson = {
  type: PlanetTypes
  radius: number
  globalMinHeight: number
  seed: number
  noiseLayers: NoiseDataJson[]
  debugNoise: boolean
}

export class PlanetData {
  type: PlanetTypes = 'terrestrial1'
  radius: number = 1
  globalMinHeight: number = 0
  seed: number = Math.floor(Math.random() * 9999)
  noiseLayers: NoiseData[] = []
  debugNoise: boolean = false

  private gui: GUI | undefined
  private noise_folder: GUI | undefined

  constructor() {}

  addNoiseLayer(): void {
    const index = this.noiseLayers.length

    this.noiseLayers.push(
      new NoiseData(() => {
        this.noiseLayers.splice(index, 1)
        this.updateNoiseFolder()
    }))

    this.updateNoiseFolder()
  }

  updateNoiseFolder() {
    if(!this.gui) { return }
    if(this.noise_folder) { this.gui.removeFolder(this.noise_folder) }
    
    this.noise_folder = this.gui.addFolder('noise layers')
    this.noise_folder.add(this, 'debugNoise')

    let index = 0
    for(let layer of this.noiseLayers) {
      layer.addGuiFolder(this.noise_folder, `layer [${index}]`)
      index++
    }
  }

  addGuiFolder(gui: GUI) {
    this.gui = gui

    const folder = gui.addFolder('planet data')
    folder.add(this, 'radius', 0.1, 2, 0.01)
    // folder.add(this, 'globalMinHeight', -1, 1, 0.001)
    folder.add(this, 'seed', 0, 9999)
    folder.add(this, 'addNoiseLayer')
    folder.add(this, 'printJson')
  }

  getJson() {
    const { type, radius, globalMinHeight, seed, noiseLayers, debugNoise } = this

    const noiseLayersJson = noiseLayers.map(layer => layer.getJson())

    const data = { type, radius, globalMinHeight, seed, noiseLayers: noiseLayersJson , debugNoise }
    return data
  }

  printJson() {
    console.log(JSON.stringify(this.getJson()))
  }


}
