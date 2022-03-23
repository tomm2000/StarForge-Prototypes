import { Scene } from "babylonjs";
import { GUI, GUIController } from "dat.gui";
import { fetchSchematics, loadSchematic } from "../../database/schematics";
import { IcoSphereMesh } from "../../IcoSphere/IcoSphereMesh";
import { download } from "../../lib/downloader";
import { destroyGUIrecursive } from "../../lib/GUI";
import { DataController } from "../planet_data/DataController";

export class Planet {
  //---- data
  private dataController: DataController 
  private _schemFile: string = ''
  get schemFile() { return this._schemFile }
  set schemFile(value: string) {
    this._schemFile = value;
    loadSchematic(value).then(data => this.regen(data))
  }

  //---- 3D
  private mesh: IcoSphereMesh | undefined
  private scene: Scene

  //---- gui
  private mainGUI: GUI | undefined
  private dataGUI: GUI | undefined
  private schematicGUI: GUIController | undefined

  //---- update
  private autoUpdate: boolean = false
  private updateInterval: NodeJS.Timer | undefined

  // ---- CONSTRUCTORS & DESTRUCTORS ----
  private constructor(scene: Scene, planetData: DataController) {
    this.scene = scene;
    this.dataController = planetData

    this.setMesh(this.generateMesh())
    this.initUpdate()
    this.generateGUI()
    this.dataController.update()
  }

  static async fromJson(scene: Scene, data: string): Promise<Planet> {
    const dataController = await DataController.fromJson(data, scene)
    const planet = new Planet(scene, dataController)
    return planet
  }
  static async fromFirebase(scene: Scene, filename: string): Promise<Planet> {
    const data = await loadSchematic(filename)
    return this.fromJson(scene, data)
  }

  static makeEmpty(scene: Scene) {
    return new Planet(scene, DataController.makeEmpty(scene))
  }

  async regen(data?: string) {
    this.dataController.dispose()
    destroyGUIrecursive(this.mainGUI)

    const dataController = data ? await DataController.fromJson(data, this.scene) : DataController.makeEmpty(this.scene)

    this.dataController = dataController

    this.setMesh(this.generateMesh())
    this.generateGUI()
    this.update()
  }

  dispose() {
    destroyGUIrecursive(this.mainGUI)
    this.dataController.dispose()
    this.mesh?.dispose()
    this.stopUpdate()
  }
  //-------------------------------------

  //---- UPDATING ----
  initUpdate() {
    this.updateInterval = setInterval(() => {
      if(this.autoUpdate) { this.update() }
    }, 16)
  }

  stopUpdate() {
    if(this.updateInterval) { clearInterval(this.updateInterval) }
    delete this.updateInterval
  }

  update() {
    this.dataController.update()
    this.mesh?.updateMesh();
  }
  //------------------

  //---- mesh ----
  generateMesh(): IcoSphereMesh {
    const mesh = new IcoSphereMesh(this.scene, undefined, this.dataController)

    return mesh
  }

  setMesh(mesh: IcoSphereMesh) {
    this.mesh?.dispose()
    this.mesh = mesh
  }
  //--------------

  //---- GUI ----
  generateGUI() {
    destroyGUIrecursive(this.mainGUI)

    this.mainGUI = new GUI()
    const folder = this.mainGUI.addFolder('functions')

    folder.add(this, 'autoUpdate')
    folder.add(this, 'update')
    folder.add(this, 'downloadJson')
    // folder.add(this, 'uploadJson')
    folder.add(this, 'resetPlanet')

    this.schematicGUI = folder.add(this, 'schemFile', [])

    folder.open()

    this.dataGUI = this.dataController.generateGui(this.mainGUI)
    
    this.updateSchematicList()
  }

  async updateSchematicList() {
    const list = await fetchSchematics()
    this.schematicGUI?.options(list)
  }

  downloadJson() {
    download('planet_data.json', this.dataController.getJson())
  }
  uploadJson() { }
  resetPlanet() { this.regen() }

}