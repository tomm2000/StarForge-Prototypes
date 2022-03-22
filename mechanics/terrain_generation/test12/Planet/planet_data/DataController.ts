import { Scene } from "babylonjs";
import { GUI } from "dat.gui";
import { destroyGUIrecursive } from "../../lib/GUI";
import { MaterialController } from "./MaterialController";
import { NoiseController } from "./NoiseController";

export type PlanetTypes = 'terrestrial1'

export const planetTypeList: PlanetTypes[] = ['terrestrial1']

type propertiesType = {
  type: PlanetTypes
  radius: number
  seed: number
  waterLevel: number
  minHeight: number
  maxHeight: number
}

export class DataController {
  //---- data
  private properties: propertiesType = {
    type: 'terrestrial1',
    radius: 1,
    seed: Math.floor(Math.random() * 9999),
    waterLevel: 0,
    minHeight: 0,
    maxHeight: 0,
  }

  //---- modules
  private noise_controller: NoiseController
  private material_controller: MaterialController

  //---- GUI
  private gui: GUI | undefined

  //---- MISC
  generateGui(gui: GUI): GUI {
    this.gui = gui.addFolder('planet data')

    // this.gui.add(this.properties, 'radius', 0.1, 2, 0.01)
    // this.gui.add(this.properties, 'seed', 0, 9999)
    //TODO: global seed for noise layers
    this.gui.add(this.properties, 'waterLevel', 0, 2, 0.01)

    this.gui.open()

    return this.gui
  }

  // ---- CONSTRUCTORS & DESTRUCTORS ----
  private constructor(noise_controller: NoiseController, material_controller: MaterialController) {
    this.noise_controller = noise_controller
    this.material_controller = material_controller
  }

  static fromJson(data: string, scene: Scene): DataController {
    const json: any = JSON.parse(data)

    const noise_controller = NoiseController.fromJson(JSON.stringify(json.noise_controller))
    const material_controller = MaterialController.fromJson(JSON.stringify(json.material_controller), scene)

    const dataController = new DataController(noise_controller, material_controller)

    dataController.properties = json.properties

    //TODO: check if the json is compatible

    return dataController
  }

  static makeEmpty(scene: Scene) { return new DataController(NoiseController.makeEmpty(), MaterialController.makeEmpty(scene)) }
  //-------------------------------------

  //---- GETTERS & SETTERS ----
  setMinHeight(value: number) { this.properties.minHeight = value }
  setMaxHeight(value: number) { this.properties.maxHeight = value }
  setMinMaxHeight(min: number, max: number) { this.properties.minHeight = min; this.properties.maxHeight = max }
  getMinHeight() { return this.properties.minHeight }
  getMaxHeight() { return this.properties.maxHeight }

  getNoiseController() { return this.noise_controller }
  getMaterialController() { return this.material_controller }
  //---------------------------

  dispose() {
    this.noise_controller.dispose()
    this.material_controller.dispose()
    destroyGUIrecursive(this.gui)
  }
  
  //---- JSON ----
  getJson(): string {
    const data: any = { properties: this.properties }

    data.noise_controller = this.noise_controller.getJson()
    data.material_controller = this.material_controller.getJson()

    return JSON.stringify(data)
  }
}