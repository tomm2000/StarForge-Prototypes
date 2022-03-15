import { GUI, GUIController } from "dat.gui";
import { destroyGUIrecursive } from "../lib/GUI";
import { BasicNoise } from "./Noise/BasicNoise";
import { NoiseController, NoiseControllerData, noiseControllerFromJson, NoiseTypes } from "./NoiseController";
import { NoiseLayer } from "./Noise/NoiseLayer";
import { download } from "../lib/downloader";
import { TestPlanet } from "../PlanetGenerators/TestPlanet";
import { fetchSchematics } from "../database/schematics";
import { getDownloadURL, ref } from "firebase/storage";
import { getFirebaseApp } from "~/mechanics/firebase/init";

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
  private parent: TestPlanet

  private gui: GUI | undefined
  private schematicListGui: GUIController | undefined

  private _schematicFile: string = ''
  private set schematicFile(name: string) {
    this._schematicFile = name
    this.loadSchematic(name)
  }
  private get schematicFile() { return this._schematicFile }

  constructor(parent: TestPlanet, controllerData?: NoiseControllerData) {
    if(controllerData) {
      this.noise_controller = noiseControllerFromJson(controllerData)
    } else {
      this.noise_controller = new NoiseController()
    }

    this.parent = parent

    fetchSchematics()
      .then(res => {
        this.schematicListGui?.options(res)
      })
  }

  generateGuiFolder(gui: GUI = new GUI()) {
    this.gui = gui

    const folder = gui.addFolder('planet data')
    folder.add(this, 'downloadJson')
    folder.add(this, 'resetData')
    this.schematicListGui = folder.add(this, 'schematicFile', [])
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

  resetData(data?: string) {
    if(data) {
      this.parent.resetPlanetData(PlanetData.fromJson(this.parent, data))
    } else {
      this.parent.resetPlanetData()
    }
  }

  private async loadSchematic(filename: string) {
    const fileRef = ref(getFirebaseApp().storage, `planet_schematics/${filename}`)

    const url = await getDownloadURL(fileRef)
    const req = await fetch(url)
    const data = await req.json()

    this.resetData(JSON.stringify(data))
  }

  static fromJson(parent: TestPlanet, data: string): PlanetData {
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

    const p_data = new PlanetData(parent, json.noise_controller_data)
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
