import { Material, Mesh, NodeMaterial, Scene } from "babylonjs";
import { setNMInputValue } from "../../lib/nodeMaterial";

export class MaterialController {
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

  async setMaterialFromFile(url: string) {
    this.randomizeID()
    this.properties.src = { value: url, type: 'url' }
    this.material = await NodeMaterial.ParseFromFileAsync('material', url, this.scene)
  }
  async setMaterialFromSnippet(id: string) {
    this.randomizeID()
    this.properties.src = { value: id, type: 'id' }
    this.material = await NodeMaterial.ParseFromSnippetAsync(id, this.scene)
  }
  setMaterial(src: string, type: 'url' | 'id' | 'none') {
    if     (type == 'id' ) { this.setMaterialFromSnippet(src) }
    else if(type == 'url') { this.setMaterialFromFile(src)    }
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

  static fromJson(data: string, scene: Scene): MaterialController {
    const json: any = JSON.parse(data)

    const material_controller = new MaterialController(scene)

    material_controller.properties = json

    const { type, value } = material_controller.properties.src
    material_controller.setMaterial(value, type)

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