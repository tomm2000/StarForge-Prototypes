import { GUI } from "dat.gui";
import { IcoSphereMesh } from "../IcoSphere/IcoSphereMesh";
import { PlanetData } from "../ObjectData/PlanetData";

import { destroyGUIrecursive } from "../lib/GUI";
import { NodeMaterial, Scene } from "babylonjs";
import { NoiseController } from "../ObjectData/NoiseController";
import { setNMInputValue } from "../lib/nodeMaterial";

export class TestPlanet {
  icoSphereMesh: IcoSphereMesh
  planetData: PlanetData
  private gui: GUI | undefined
  private autoUpdate: boolean = false
  private updateInterval: NodeJS.Timer | undefined
  private scene: Scene;

  constructor(scene: Scene, radius: number = 1, planetData?: string) {
    this.scene = scene;

    this.planetData = planetData ? PlanetData.fromJson(planetData) : new PlanetData()

    this.createGui()

    this.icoSphereMesh = new IcoSphereMesh(this.scene, undefined, this.planetData.noise_controller)

    NodeMaterial.ParseFromSnippetAsync(this.planetData.materialId, this.scene).then(nodeMaterial => {
      this.icoSphereMesh.setMaterial(nodeMaterial)
      this.updateMaterialNodes()
    })

    this.updateInterval = setInterval(() => {
      if(this.autoUpdate) {
        this.reload()
      }
    }, 16)
  }

  updateMaterialNodes(): void {
    const material = this.icoSphereMesh.getMaterial()
    setNMInputValue(material, 'INheightMultiplier', this.planetData.materialHeightMultiplier)
    setNMInputValue(material, 'INseaLevel',         this.planetData.waterLevel)
    setNMInputValue(material, 'INminHeight',        this.icoSphereMesh.getMinHeight())
    setNMInputValue(material, 'INmaxHeight',        this.icoSphereMesh.getMaxHeight())
  }

  createGui() {
    this.gui = new GUI()

    this.gui.add(this, 'reload')
    this.gui.add(this, 'autoUpdate')

    this.planetData.generateGuiFolder(this.gui) 
  }

  reload() {
    this.icoSphereMesh.updateMesh()
    this.updateMaterialNodes()
  }

  dispose() {
    if(this.updateInterval) { clearInterval(this.updateInterval) }
    this.icoSphereMesh.dispose()
    destroyGUIrecursive(this.gui)
    this.planetData.dispose()
  }
}