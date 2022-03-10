import { GUI } from "dat.gui";
import { IcoSphereMesh } from "../IcoSphere/IcoSphereMesh";
import { PlanetData } from "../ObjectData/PlanetData";

import { destroyGUIrecursive } from "../lib/GUI";
import { Scene } from "babylonjs";

export class TestPlanet {
  icoSphereMesh: IcoSphereMesh
  planetData: PlanetData
  private gui: GUI | undefined
  private autoUpdate: boolean = false
  private updateInterval: NodeJS.Timer | undefined
  private scene: Scene;

  constructor(scene: Scene, radius: number = 1, planetData: PlanetData = new PlanetData()) {
    this.scene = scene;

    this.planetData = planetData

    this.createGui()

    this.icoSphereMesh = new IcoSphereMesh(this.scene, undefined, planetData.getNoiseLayers())

    this.updateInterval = setInterval(() => {
      if(this.autoUpdate) {
        this.reload()
      }
    }, 16)
  }

  createGui() {
    this.gui = new GUI()

    this.gui.add(this, 'reload')
    this.gui.add(this, 'autoUpdate')

    this.planetData.generateGuiFolder(this.gui) 
  }

  reload() {
    this.icoSphereMesh.updateMesh()
  }

  dispose() {
    if(this.updateInterval) { clearInterval(this.updateInterval) }
    this.icoSphereMesh.dispose()
    destroyGUIrecursive(this.gui)
    this.planetData.dispose()
  }
}