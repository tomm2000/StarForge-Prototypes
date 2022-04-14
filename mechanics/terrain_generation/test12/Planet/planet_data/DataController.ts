import { Mesh, Scene } from "babylonjs";
import { GUI } from "dat.gui";
import { destroyGUIrecursive } from "../../lib/GUI";
import { MaterialController } from "./MaterialController";
import { NoiseController } from "./NoiseController";

export type PlanetTypes = 'terrestrial1'

export const planetTypeList: PlanetTypes[] = ['terrestrial1']

type propertiesType = {
  type: PlanetTypes
  radius: number
  scale: number
  seed: number
  sea_level: number
  min_height: number
  max_height: number
}

export class DataController {
  //---- data
  private properties: propertiesType = {
    type: 'terrestrial1',
    radius: 1,
    scale: 1,
    seed: Math.floor(Math.random() * 9999),
    sea_level: 0,
    min_height: 0,
    max_height: 0,
  }

  //---- modules
  private noise_controller: NoiseController | undefined
  private material_controller: MaterialController | undefined

  //---- GUI
  private gui: GUI | undefined

  //---- MISC
  generateGui(gui: GUI): GUI {
    this.gui = gui.addFolder('planet data')

    this.gui.add(this.properties, 'radius', 0.1, 10, 0.1).onChange(() => {
      this.noise_controller!.changedLayer = 0
    })
    this.gui.add(this.properties, 'scale', 0.1, 10, 0.01)
    // this.gui.add(this.properties, 'seed', 0, 9999)
    //TODO: global seed for noise layers
    this.gui.add(this.properties, 'sea_level', 0, 1, 0.01)

    this.material_controller!.generateGUI(gui)
    this.noise_controller!.generateGUI()

    return this.gui
  }

  setNoiseController(noise_controller: NoiseController) { this.noise_controller = noise_controller }
  setMaterialController(material_controller: MaterialController) { this.material_controller = material_controller }

  // ---- CONSTRUCTORS & DESTRUCTORS ----
  private constructor() {
    // this.noise_controller = noise_controller
    // this.material_controller = material_controller
  }

  static async fromJson(data: object, scene: Scene): Promise<DataController> {
    const json: any = data


    const dataController = new DataController()
    
    const noise_controller = NoiseController.fromJson(json.noise_controller, dataController)
    const material_controller = await MaterialController.fromJson(json.material_controller, scene)

    dataController.setNoiseController(noise_controller)
    dataController.setMaterialController(material_controller)

    for(let key in json.properties) {
      (dataController.properties as any)[key] = json.properties[key]
    }

    //TODO: check if the json is compatible

    return dataController
  }

  static makeEmpty(scene: Scene) {
    let data_controller = new DataController() 
    data_controller.setNoiseController(NoiseController.makeEmpty(data_controller))
    data_controller.setMaterialController(MaterialController.makeEmpty(scene))
    return data_controller
  }
  //-------------------------------------

  //---- GETTERS & SETTERS ----
  setMinHeight(value: number) { this.properties.min_height = value }
  setMaxHeight(value: number) { this.properties.max_height = value }
  setMinMaxHeight(min: number, max: number) { this.properties.min_height = min; this.properties.max_height = max; }
  getMinHeight() { return this.properties.min_height }
  getMaxHeight() { return this.properties.max_height }

  getRadius() { return this.properties.radius }
  getScale() { return this.properties.scale }

  getNoiseController() { return this.noise_controller }
  getMaterialController() { return this.material_controller }
  //---------------------------

  dispose() {
    this.noise_controller!.dispose()
    this.material_controller!.dispose()
    destroyGUIrecursive(this.gui)
  }

  //---- MATERIAL CONTROLLER ----
  updateMeshMaterial(mesh: Mesh, id: number | undefined) {
    this.material_controller!.updateNodes([
      { name: 'INminHeight', value: this.properties.min_height  },
      { name: 'INmaxHeight', value: this.properties.max_height  },
      { name: 'INseaLevel' , value: this.properties.sea_level },
    ])

    return this.material_controller!.updateMeshMaterial(mesh, id)
  }
  
  //---- JSON ----
  getJson(): object {
    const data: any = { properties: this.properties }

    data.noise_controller = this.noise_controller!.getJson()
    data.material_controller = this.material_controller!.getJson()

    return data
  }
}