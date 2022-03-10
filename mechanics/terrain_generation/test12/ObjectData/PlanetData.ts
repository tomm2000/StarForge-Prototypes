import { GUI } from "dat.gui";
import { destroyGUIrecursive } from "../lib/GUI";
import { BasicNoise } from "./Noise/BasicNoise";
import { NoiseLayer, NoiseTypes } from "./Noise/NoiseType";

export type PlanetTypes = 'terrestrial1'

export const planetTypeList: PlanetTypes[] = ['terrestrial1']

export class PlanetData {
  type: PlanetTypes = 'terrestrial1'
  radius: number = 1
  seed: number = Math.floor(Math.random() * 9999)
  noiseLayers: NoiseLayer[] = []
  // https://nme.babylonjs.com/#XRRVZX#49
  materialId: string = 'XRRVZX#49'
  materialHeightMultiplier: number = 1

  private gui: GUI | undefined
  private noise_folder: GUI | undefined

  constructor() {}

  addNoiseLayer(): void {
    let index = this.noiseLayers.length

    const layer = new NoiseLayer(undefined, this, index)
    layer.generateGui()

    this.noiseLayers.push(layer)
  }

  changeNoiseLayer(type: NoiseTypes, layer: NoiseLayer) {
    let index = this.noiseLayers.indexOf(layer)

    let new_layer: NoiseLayer | undefined = undefined

    if(type == 'basic') {
      new_layer = new BasicNoise(undefined, this, index)
    } else if(type == 'default') {
      new_layer = new NoiseLayer(undefined, this, index)
    }

    if(!new_layer) { return }

    let gui = layer.getGui()
    gui?.parent.removeFolder(gui)

    layer.dispose(false)

    new_layer.generateGui(gui?.parent)

    this.noiseLayers[index] = new_layer
  }

  generateGuiFolder(gui: GUI = new GUI()) {
    this.gui = gui

    const folder = gui.addFolder('planet data')
    folder.add(this, 'radius', 0.1, 2, 0.01)
    // folder.add(this, 'globalMinHeight', -1, 1, 0.001)
    folder.add(this, 'seed', 0, 9999)
    // folder.add(this, 'materialHeightMultiplier', 0, 1, 0.01)
    folder.add(this, 'addNoiseLayer')

    folder.open()
  }

  getNoiseLayers() { return this.noiseLayers }

  dispose() {
    destroyGUIrecursive(this.gui) 
    this.noiseLayers.forEach(layer => layer.dispose())
  }
}
