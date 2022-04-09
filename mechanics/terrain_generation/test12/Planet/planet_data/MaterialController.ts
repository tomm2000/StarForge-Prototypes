import { Material, Mesh, NodeMaterial, Scene } from "babylonjs";
import { GUI } from "dat.gui";
import { fetchMaterials, getMaterialUrl } from "../../database/materials";
import { setNMInputValue } from "../../lib/nodeMaterial";

type materialType = {
  value: string,
  type: 'url' | 'id' | 'none'
}

export class MaterialController {
  // https://nme.babylonjs.com/#XRRVZX#64
  private properties: {
    src: materialType
  }

  private id: number = Math.random()
  private material: Material | undefined
  private scene: Scene
  private gui: GUI | undefined = undefined

  private _materialName: string = ''
  get materialName(): string { return this._materialName }
  set materialName(value: string) {
    getMaterialUrl(value).then((url) => {
      this.properties.src.value = url
      this.properties.src.type = 'url'

      this.gui?.updateDisplay()

      this.loadMaterial()
    })
  }

  private constructor(scene: Scene) {
    this.scene = scene
    this.properties = { src: { type: 'none', value: '' } }

    
  }

  generateGUI(gui: GUI): GUI {
    const folder = gui.addFolder('material')

    folder.add(this.properties.src, 'value', '')
    folder.add(this.properties.src, 'type', ['url', 'id'])
    folder.add(this, 'loadMaterial')
    
    fetchMaterials().then((list) => { folder.add(this, 'materialName', list) })

    // folder.open()

    this.gui = folder

    return folder
  }
  /**
   * USED FOR THE GUI
   * uses the material src stored in the properties to update the material
  */
  private loadMaterial() { this.setMaterial(this.properties.src.value, this.properties.src.type) }

  /** stores & initializes the material from the given src */
  async setMaterial(value: string, type: 'url' | 'id' | 'none'): Promise<Material> {
    this.randomizeID()
    this.properties.src.value = value
    this.properties.src.type = type

    return await this.initMaterial()
  }
  /** uses the material stored in the properties to create a new node material */
  private async initMaterial(): Promise<Material> {
    if     (this.properties.src.type == 'url' ) {
      this.material = await NodeMaterial.ParseFromFileAsync('material', this.properties.src.value, this.scene)
    }
    else if(this.properties.src.type == 'id') {
      this.material = await NodeMaterial.ParseFromSnippetAsync(this.properties.src.value, this.scene)
    }
    else { throw 'wrong material type' }
    return this.material
  }

  /** randomized the id, the id is used to identify a material
   * the mesh checks if there is a new ID, if so it will update its material accordingly
   */
  private randomizeID() { this.id = Math.random() }

  getMaterial(): Material | undefined {
    return this.material
  }

  /** if there is a new id, the material of the given mesh will be updated */
  updateMeshMaterial(mesh: Mesh, id: number | undefined): number {
    if(id != this.id && this.material) { mesh.material = this.material }
    return this.id
  }

  /** updates the material nodes using the given parameters */
  updateNodes(nodes: {name: string, value: any}[]) {
    for(let node of nodes) {
      setNMInputValue(this.material, node.name, node.value)
    }
  }

  static async fromJson(data: object, scene: Scene): Promise<MaterialController> {
    const json: any = data

    const material_controller = new MaterialController(scene)

    material_controller.properties = json

    const { type, value } = material_controller.properties.src

    const m = await material_controller.setMaterial(value, type)


    return material_controller
  }

  static makeEmpty(scene: Scene): MaterialController {
    return new MaterialController(scene)
  }

  getJson(): object {
    const data: any = this.properties

    return data
  }

  dispose() {
    this.material?.dispose() 
  }
}