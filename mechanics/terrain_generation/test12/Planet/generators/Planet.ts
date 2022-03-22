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
  private _schematicFile: string = ''
  get schematicFile() { return this._schematicFile }
  set schematicFile(value: string) {
    this._schematicFile = value;
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

    this.initUpdate()
    this.generateGUI()
    this.setMesh(this.generateMesh())
  }

  static fromJson(scene: Scene, data: string): Planet {
    return new Planet(scene, DataController.fromJson(data, scene))
  }

  static makeEmpty(scene: Scene) {
    return new Planet(scene, DataController.makeEmpty(scene))
  }

  regen(data?: string) {
    this.dataController.dispose()
    destroyGUIrecursive(this.mainGUI)

    const planetData = data ? DataController.fromJson(data, this.scene) : DataController.makeEmpty(this.scene)

    this.dataController = planetData

    this.setMesh(this.generateMesh())
    this.generateGUI()
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

  update() { this.mesh?.updateMesh(); }
  //------------------

  //---- mesh ----
  generateMesh(): IcoSphereMesh {
    const mesh = new IcoSphereMesh(this.scene, undefined, this.dataController)
    mesh.generateNewMesh()

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

    this.schematicGUI = folder.add(this, 'schematicFile', [])

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