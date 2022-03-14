import { GUI } from "dat.gui";
import { destroyGUIrecursive } from "../lib/GUI";
import { BasicNoise } from "./Noise/BasicNoise";
import { NoiseController, NoiseControllerData, noiseControllerFromJson, NoiseTypes } from "./NoiseController";
import { NoiseLayer } from "./Noise/NoiseLayer";
import { download } from "../lib/downloader";

export type PlanetTypes = 'terrestrial1'

export const planetTypeList: PlanetTypes[] = ['terrestrial1']

export class PlanetData {
  type: PlanetTypes = 'terrestrial1'
  radius: number = 1
  seed: number = Math.floor(Math.random() * 9999)
  // https://nme.babylonjs.com/#XRRVZX#49
  materialId: string = 'XRRVZX#49'
  materialHeightMultiplier: number = 1
  waterLevel: number = 0

  noise_controller: NoiseController

  private gui: GUI | undefined

  constructor(controllerData?: NoiseControllerData) {
    if(controllerData) {
      this.noise_controller = noiseControllerFromJson(controllerData)
    } else {
      this.noise_controller = new NoiseController()
    }
  }


  generateGuiFolder(gui: GUI = new GUI()) {
    this.gui = gui

    const folder = gui.addFolder('planet data')
    folder.add(this, 'downloadJson')
    folder.add(this, 'radius', 0.1, 2, 0.01)
    // folder.add(this, 'globalMinHeight', -1, 1, 0.001)
    folder.add(this, 'seed', 0, 9999)
    folder.add(this, 'waterLevel', 0, 2, 0.01)
    // folder.add(this, 'materialHeightMultiplier', 0, 1, 0.01)

    folder.open()
  }

  dispose() {
    destroyGUIrecursive(this.gui) 
    this.noise_controller.dispose()
  }

  getJson(): string {
    const { type, radius, seed, waterLevel, materialHeightMultiplier, materialId } = this

    const noise_controller_data = this.noise_controller.getJson()

    const data = {
      type, version: 0.1, radius, seed, waterLevel, materialId, materialHeightMultiplier, noise_controller_data
    }

    return JSON.stringify(data)
  }

  downloadJson() {
    download('planet_data.json', this.getJson())
  }

  static fromJson(data: string): PlanetData {
    const json = JSON.parse(data)

    if(
      json.type == undefined ||
      json.version == undefined ||
      json.radius == undefined ||
      json.seed == undefined ||
      json.waterLevel == undefined ||
      json.materialId == undefined ||
      json.materialHeightMultiplier == undefined ||
      json.noise_controller_data == undefined
    ) {
      console.table(json)
      throw 'error with the planet data'
    }

    const p_data = new PlanetData(json.noise_controller_data)
    // const p_data = new PlanetData()

    // console.log(json.noise_controller_data)

    p_data.type = json.type
    p_data.waterLevel = json.waterLevel
    p_data.radius = json.radius
    p_data.seed = json.seed
    p_data.materialId = json.materialId
    p_data.materialHeightMultiplier = json.materialHeightMultiplier

    return p_data
  }
}
