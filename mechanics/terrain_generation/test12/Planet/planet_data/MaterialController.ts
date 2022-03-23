import { Material, Mesh, NodeMaterial, Scene } from "babylonjs";
import { setNMInputValue } from "../../lib/nodeMaterial";

export class MaterialController {
  // https://nme.babylonjs.com/#XRRVZX#49
  private properties: {
    src: { value: string, type: 'url' | 'id' | 'none' }
  }

  private id: number = Math.random()
  private material: Material | undefined
  private scene: Scene

  private constructor(scene: Scene) {
    this.scene = scene
    this.properties = { src: { type: 'none', value: '' } }
  }

  async setMaterial(value: string, type: 'url' | 'id' | 'none'): Promise<Material> {
    this.randomizeID()
    this.properties.src = { value, type }
    return await this.initMaterial()
  }
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

  private randomizeID() { this.id = Math.random() }

  getMaterial(): Material | undefined {
    return this.material
  }

  updateMeshMaterial(mesh: Mesh, id: number | undefined): number {
    if(id != this.id && this.material) { mesh.material = this.material }
    return this.id
  }

  updateNodes(nodes: {name: string, value: any}[]) {
    for(let node of nodes) {
      setNMInputValue(this.material, node.name, node.value)
    }
  }

  static async fromJson(data: string, scene: Scene): Promise<MaterialController> {
    const json: any = JSON.parse(data)

    const material_controller = new MaterialController(scene)

    material_controller.properties = json

    const { type, value } = material_controller.properties.src

    const m = await material_controller.setMaterial(value, type)


    return material_controller
  }

  static makeEmpty(scene: Scene): MaterialController {
    return new MaterialController(scene)
  }

  getJson(): string {
    const data: any = this.properties

    return data
  }

  dispose() {
    this.material?.dispose()
  }
}