import { GUI } from "dat.gui";
import { NodeMaterial, Scene } from "babylonjs";
import { IcoSphereMesh } from "../lib/IcoSphereMesh";
import { PlanetData } from "./PlanetData";
import { positionShader } from "../../common/IcoSphere/positionShader";
import { GPGPUuniform } from "../../common/lib/GPGPU";
import { noiseId } from "../../common/PlanetData/NoiseDataJson";
import { PlanetDataJson } from "../../common/PlanetData/PlanetDataJson";

export class BasePlanet {
  protected icoSphereMesh: IcoSphereMesh
  protected planetData: PlanetData
  protected gui: GUI
  private autoUpdate: boolean = false
  private updateInterval: NodeJS.Timer | undefined
  private scene: Scene;

  constructor(scene: Scene, planetData: PlanetData = new PlanetData()) {
    this.scene = scene;
    this.planetData = planetData
    this.gui = this.createGui()

    this.icoSphereMesh = new IcoSphereMesh(this.scene, undefined, this.getPositionShader(), this.getPositionUniforms())

    NodeMaterial.ParseFromSnippetAsync(this.planetData.getData().materialId, this.scene).then(nodeMaterial => {
      this.icoSphereMesh.setMaterial(nodeMaterial)
      this.updateMaterialNodes()
    })

    this.icoSphereMesh.generateNewMesh()

    this.updateInterval = setInterval(() => {
      if(this.autoUpdate) {
        this.reload()
      }
    }, 16)
  }

  //---- GUI -------------------------
  createGui(): GUI {
    const gui = new GUI()

    gui.add(this, 'reload')
    gui.add(this, 'autoUpdate')

    this.planetData.generateGUI(gui)

    return gui
  }
  destroyGui() {
    this.gui.destroy()
  }
  reloadGui() {
    this.destroyGui()
    this.gui = this.createGui()
  }
  //----------------------------------

  //---- planet data -----------------
  setPlanetData(planetData: PlanetDataJson) {
    this.planetData.setData(planetData)
    this.reloadGui()
    this.reload()
  }

  updateMaterialNodes() { }

  getPlanetData(): PlanetDataJson {
    return this.planetData.getData()
  }

  getPositionShader(): positionShader {
    return {fragmentSource: '', vertexSource: ''}
  }

  getPositionUniforms(): GPGPUuniform[] {
    let uniforms: GPGPUuniform[] = [
      { name: 'radius'      , type: 'uniform1f', value: this.planetData.getData().radius             },
      { name: 'layerAmount' , type: 'uniform1i', value: this.planetData.getData().noiseLayers.length },
      { name: 'seed'        , type: 'uniform1i', value: this.planetData.getData().seed               },
      { name: 'waterLevel'  , type: 'uniform1f', value: this.planetData.getData().waterLevel         },
      { name: 'oceanDepth'  , type: 'uniform1f', value: this.planetData.getData().oceanDepth         },
      { name: 'oceanFloor'  , type: 'uniform1f', value: this.planetData.getData().oceanFloor         },

    ]

    const nl = this.planetData.getData().noiseLayers

    if(nl.length > 0) {
      uniforms = [...uniforms,
        //* integers
        {name: 'layerPrevMask'  ,      type: 'uniform1iv', value: nl.map(layer => layer.prevMaskUse)},
        {name: 'layerFirstMask' ,      type: 'uniform1iv', value: nl.map(layer => layer.firstMaskUse)},
        {name: 'layerMaskOnly' ,      type: 'uniform1iv', value: nl.map(layer => layer.maskOnly ? 1 : 0)},
        {name: 'layerNoiseType',      type: 'uniform1iv', value: nl.map(layer => noiseId(layer.noiseType))},
        {name: 'layerOctaves',        type: 'uniform1iv', value: nl.map(layer => layer.octaves)},
        {name: 'layerExponent',       type: 'uniform1iv', value: nl.map(layer => layer.exponent)},

        //* floats
        {name: 'layerAmplitude',      type: 'uniform1fv', value: nl.map(layer => layer.amplitude)},
        {name: 'layerScale'   ,       type: 'uniform1fv', value: nl.map(layer => layer.scale)},
        {name: 'layerMinHeight',      type: 'uniform1fv', value: nl.map(layer => layer.minHeight)},
        {name: 'layerMaskMultiplier', type: 'uniform1fv', value: nl.map(layer => layer.maskMultiplier)},
        {name: 'layerPersistance',    type: 'uniform1fv', value: nl.map(layer => layer.persistance)},
        {name: 'layerLacunarity',     type: 'uniform1fv', value: nl.map(layer => layer.lacunarity)},
      ]
    }

    return uniforms
  }
  //----------------------------------

  //---- lifecycle -------------------
  reload() {
    this.icoSphereMesh.setPositionUniforms(this.getPositionUniforms())
    this.icoSphereMesh.updateMesh()
    this.updateMaterialNodes()
  }

  dispose() {
    if(this.updateInterval) { clearInterval(this.updateInterval) }
    this.icoSphereMesh.dispose()
    this.gui.destroy()
    this.planetData.dispose() 
  }
  //----------------------------------
}