import { GUI } from "dat.gui";
import { destroyGUIrecursive } from "../lib/GUI";
import { NoiseController } from "./NoiseController";

export type PlanetTypes = 'terrestrial1'

export const planetTypeList: PlanetTypes[] = ['terrestrial1']

export class PlanetData {
  //---- data
  private type: PlanetTypes = 'terrestrial1'
  private radius: number = 1
  private seed: number = Math.floor(Math.random() * 9999)
  private materialId: string = 'XRRVZX#49'
  private materialHeightMultiplier: number = 1
  private waterLevel: number = 0
  private minHeight: number = 0
  private maxHeight: number = 0

  //---- parts
  private noise_controller: NoiseController

  //---- GUI
  private gui: GUI | undefined

  generateGui(gui: GUI): GUI {
    this.gui = gui.addFolder('planet data')

    this.gui.add(this, 'radius', 0.1, 2, 0.01)
    this.gui.add(this, 'seed', 0, 9999)
    this.gui.add(this, 'waterLevel', 0, 2, 0.01)

    this.gui.open()

    return this.gui
  }

  // ---- CONSTRUCTORS & DESTRUCTORS ----
  private constructor(noise_controller: NoiseController) {
    this.noise_controller = noise_controller
  }

  static fromJson(data: string): PlanetData {
    const json: any = JSON.parse(data)

    if(json.version != JSON_VERSION) { throw 'wrong json version for controller' }

    const controller = NoiseController.fromJson(JSON.stringify(json.noise_controller_data))

    const planetData = new PlanetData(controller)

    for(let k in json) {
      if((planetData as any)[k] != undefined && k != 'version') {
        (planetData as any)[k] = json[k]
      }
    }

    return planetData
  }

  static makeEmpty() { return new PlanetData(NoiseController.makeEmpty()) }
  //-------------------------------------

  //---- GETTERS & SETTERS ----
  setMinHeight(value: number) { this.minHeight = value }
  setMaxHeight(value: number) { this.maxHeight = value }
  setMinMaxHeight(min: number, max: number) { this.minHeight = min; this.maxHeight = max }
  getMinHeight() { return this.minHeight }
  getMaxHeight() { return this.maxHeight }

  getNoiseController() { return this.noise_controller }
  //---------------------------

  dispose() {
    this.noise_controller.dispose()
    destroyGUIrecursive(this.gui)
  }
  
  //---- JSON ----
  getJson(): string {
    const data: any = {}

    const properites = Object.getOwnPropertyNames(this)

    for(let k of properites) {
      if(k != 'gui' && k != 'noise_controller' && k != '__ob__') {
        data[k] = (this as any)[k]
      }
    }

    data.noise_controller = this.noise_controller.getJson()

    return JSON.stringify(data)
  }
}


const JSON_VERSION = 0.1