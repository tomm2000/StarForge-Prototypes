import { Scene } from "babylonjs";
import { GUI, GUIController } from "dat.gui";
import { fetchSchematics, loadSchematic } from "../database/schematics";
import { IcoSphereMesh } from "../IcoSphere/IcoSphereMesh";
import { download } from "../lib/downloader";
import { destroyGUIrecursive } from "../lib/GUI";
import { PlanetData } from "../ObjectData/PlanetData";

export class Planet {
  //---- data
  private planetData: PlanetData 
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
  private constructor(scene: Scene, planetData: PlanetData) {
    this.scene = scene;
    this.planetData = planetData

    this.initUpdate()
    this.generateGUI()
    this.setMesh(this.generateMesh())
  }

  static fromJson(scene: Scene, data: string): Planet {
    return new Planet(scene, PlanetData.fromJson(data))
  }

  static makeEmpty(scene: Scene) {
    return new Planet(scene, PlanetData.makeEmpty())
  }

  regen(data?: string) {
    this.planetData.dispose()
    destroyGUIrecursive(this.mainGUI)

    const planetData = data ? PlanetData.fromJson(data) : PlanetData.makeEmpty()

    this.planetData = planetData

    this.setMesh(this.generateMesh())
    this.generateGUI()
  }

  dispose() {
    destroyGUIrecursive(this.mainGUI)
    this.planetData.dispose()
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
    const mesh = new IcoSphereMesh(this.scene, undefined, this.planetData)
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
    folder.add(this, 'uploadJson')
    folder.add(this, 'resetPlanet')

    this.schematicGUI = folder.add(this, 'schematicFile', [])

    folder.open()

    this.dataGUI = this.planetData.generateGui(this.mainGUI)
    
    this.updateSchematicList()
  }

  async updateSchematicList() {
    const list = await fetchSchematics()
    this.schematicGUI?.options(list)
  }

  downloadJson() {
    download('planet_data.json', this.planetData.getJson())
  }
  uploadJson() { }
  resetPlanet() { this.regen() }

}