import { GUI } from "dat.gui";
import { destroyGUIrecursive } from "../lib/GUI";
import { BasicNoise } from "./Noise/BasicNoise";
import { NoiseController } from "./Noise/NoiseController";
import { NoiseLayer, NoiseTypes } from "./Noise/NoiseType";

export type PlanetTypes = 'terrestrial1'

export const planetTypeList: PlanetTypes[] = ['terrestrial1']

export class PlanetData {
  type: PlanetTypes = 'terrestrial1'
  radius: number = 1
  seed: number = Math.floor(Math.random() * 9999)
  // https://nme.babylonjs.com/#XRRVZX#49
  materialId: string = 'XRRVZX#49'
  materialHeightMultiplier: number = 1

  noise_controller: NoiseController = new NoiseController()

  private gui: GUI | undefined

  constructor() {}


  generateGuiFolder(gui: GUI = new GUI()) {
    this.gui = gui

    const folder = gui.addFolder('planet data')
    folder.add(this, 'radius', 0.1, 2, 0.01)
    // folder.add(this, 'globalMinHeight', -1, 1, 0.001)
    folder.add(this, 'seed', 0, 9999)
    // folder.add(this, 'materialHeightMultiplier', 0, 1, 0.01)

    folder.open()

    this.noise_controller.generateGUI()
  }

  dispose() {
    destroyGUIrecursive(this.gui) 
    this.noise_controller.dispose()
  }
}
