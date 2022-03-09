import { NodeMaterial, Scene } from "babylonjs";
import { IcoSphereMesh } from "../lib/IcoSphereMesh";
import { PlanetData } from "./PlanetData";
import { positionShader } from "../../common/IcoSphere/positionShader";
import { GPGPUuniform } from "../../common/lib/GPGPU";
import { PlanetDataJson } from "../../common/PlanetData/PlanetDataJson";
import { noiseId } from "../../common/PlanetData/NoiseDataJson";

export class BasePlanet {
  protected icoSphereMesh: IcoSphereMesh
  protected planetData: PlanetData
  private scene: Scene;

  constructor(scene: Scene, planetData: PlanetData = new PlanetData()) {
    this.scene = scene;
    this.planetData = planetData

    this.icoSphereMesh = new IcoSphereMesh(this.scene, undefined, this.getPositionShader(), this.getPositionUniforms())

    NodeMaterial.ParseFromSnippetAsync(this.planetData.getData().materialId, this.scene).then(nodeMaterial => {
      this.icoSphereMesh.setMaterial(nodeMaterial)
      this.updateMaterialNodes()
    })

    this.icoSphereMesh.generateNewMesh()
  }

  //---- planet data -----------------
  setPlanetData(planetData: PlanetDataJson) {
    this.planetData.setData(planetData)
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


  dispose() {
    this.icoSphereMesh.dispose()
  }
  //----------------------------------
}