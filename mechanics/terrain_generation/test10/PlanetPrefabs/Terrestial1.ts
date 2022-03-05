import { GUI } from "dat.gui";
import { Mesh, NodeMaterial, Scene } from "babylonjs";
import { getPlanetGUI } from "../GUI/SpaceObjectGUI";
import { IcoSphereMesh } from "../IcoSphere/IcoSphereMesh";
import { PlanetData, PlanetDataJson } from "../ObjectData/PlanetData";

import { getDefaultPositionShaderVertex, positionShader } from "../IcoSphere/positionShader";
import { basicNoiseLayer, noise3D } from "../lib/GlslNoise";
import { noiseId } from "../ObjectData/NoiseData";

export class Terrestrial1 {
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

    this.icoSphereMesh = new IcoSphereMesh(this.scene, undefined, this.getPositionShader())

    NodeMaterial.ParseFromSnippetAsync(this.planetData.getData().materialId, this.scene).then(nodeMaterial => {
      this.icoSphereMesh.setMaterial(nodeMaterial)
    })

    this.updateInterval = setInterval(() => {
      if(this.autoUpdate) {
        this.reload()
      }
    }, 16)
  }

  createGui() { this.gui = getPlanetGUI(this.planetData, this) }
  destroyGui() { this.gui?.destroy() }
  reloadGui() { this.destroyGui(); this.createGui() }

  setPlanetData(planetData: PlanetDataJson) {
    this.planetData.setData(planetData)
    this.reloadGui()
    this.reload()
  }

  reload() {
    this.icoSphereMesh.setPositionShader(this.getPositionShader())
    this.icoSphereMesh.updateMesh()
  }
  
  getMesh(): Mesh { return this.icoSphereMesh.getMesh() }

  dispose() {
    if(this.updateInterval) { clearInterval(this.updateInterval) }
    this.icoSphereMesh.dispose()
    this.gui?.destroy()
  }

  getPositionShader(): positionShader {
    const fs = /*glsl*/`
      precision highp float;

      #define MAX_LAYERS 32

      uniform float radius;
      uniform int debugNoise;
      uniform int layerAmount;
      uniform int seed;

      uniform float layerAmplitude[MAX_LAYERS];
      uniform int layerUsePrev[MAX_LAYERS];
      uniform int layerUseFirst[MAX_LAYERS];
      uniform int layerMaskOnly[MAX_LAYERS];
      uniform float layerScale[MAX_LAYERS];
      uniform float layerMinHeight[MAX_LAYERS];
      uniform int layerNoiseType[MAX_LAYERS];
      uniform float layerMaskMultiplier[MAX_LAYERS];
      uniform int layerOctaves[MAX_LAYERS];
      uniform float layerLacunarity[MAX_LAYERS];
      uniform float layerPersistance[MAX_LAYERS];
      uniform int layerExponent[MAX_LAYERS];

      uniform sampler2D texture;
      varying vec2 vTextureCoord;

      ${noise3D}

      ${basicNoiseLayer}

      void main() {
        // restoring data from [0,1] -> [0,2] -> [-1,1]
        vec4 position = (texture2D(texture, vTextureCoord) * 2.0) - 1.0;

        float elevation = 1.0;
        float base_elevation = 1.0;
        float prev_elevation = 1.0;

        for(int i = 0; i < MAX_LAYERS; i++) {
          if(i >= layerAmount) { break; }

          // ---- mask setup
          float mask = 1.0;
          if(layerUseFirst[i] == 1)           { mask = base_elevation; }
          if(layerUsePrev[i] == 1 && i >= 1) { mask = prev_elevation; }
          // ---------------

          // ---- noise generation
          float level_elevation = 1.0;

          level_elevation = basicNoiseLayer(layerMinHeight[i], layerAmplitude[i], layerScale[i], layerLacunarity[i], layerPersistance[i], layerExponent[i], layerOctaves[i], mask, position.xyz, seed + i);
          // ---------------------

          // ---- mask and elevation finalization
          if(i == 0) { base_elevation = level_elevation * layerMaskMultiplier[i]; }

          if(layerMaskOnly[i] == 0) {
            prev_elevation = level_elevation * mask * layerMaskMultiplier[i];
            elevation += level_elevation * mask;
          } else {
            prev_elevation = (level_elevation * mask) == 0.0 ? 0.0 : 0.5;

            if(debugNoise == 1){
              elevation += (level_elevation * mask) == 0.0 ? 0.0 : 0.5; //* for debugging noise only!
            }
          }
          // ------------------------------------
        }

        // normalizing data from [-1,1] -> [0,2] -> [0,1]
        vec3 pos = (position.xyz + 1.0) / 2.0;

        gl_FragColor = vec4(pos, 1.0 / (elevation * radius));
        // gl_FragColor = vec4(pos, 1.0 / layerAmplitude[0]);
      }
    `

    const shader: positionShader = getDefaultPositionShaderVertex(fs)

    shader.uniforms = [
      {name: 'radius'      , type: 'uniform1f', value: this.planetData.getData().radius},
      {name: 'debugNoise'  , type: 'uniform1i', value: this.planetData.getData().debugNoise ? 1 : 0},
      {name: 'layerAmount' , type: 'uniform1i', value: this.planetData.getData().noiseLayers.length},
      {name: 'seed'        , type: 'uniform1i', value: this.planetData.getData().seed},
    ]

    if(this.planetData.getData().noiseLayers.length > 0) {

      shader.uniforms = [...shader.uniforms,
        {name: 'layerAmplitude',      type: 'uniform1fv', value: this.planetData.getData().noiseLayers.map(layer => layer.amplitude)},
        {name: 'layerUsePrev'  ,      type: 'uniform1iv', value: this.planetData.getData().noiseLayers.map(layer => layer.usePrevLayerAsMask  ? 1 : 0)},
        {name: 'layerUseFirst' ,      type: 'uniform1iv', value: this.planetData.getData().noiseLayers.map(layer => layer.useFirstLayerAsMask ? 1 : 0)},
        {name: 'layerMaskOnly' ,      type: 'uniform1iv', value: this.planetData.getData().noiseLayers.map(layer => layer.maskOnly ? 1 : 0)},
        {name: 'layerScale'   ,       type: 'uniform1fv', value: this.planetData.getData().noiseLayers.map(layer => layer.scale)},
        {name: 'layerMinHeight',      type: 'uniform1fv', value: this.planetData.getData().noiseLayers.map(layer => layer.minHeight)},
        {name: 'layerNoiseType',      type: 'uniform1iv', value: this.planetData.getData().noiseLayers.map(layer => noiseId(layer.noiseType))},
        {name: 'layerMaskMultiplier', type: 'uniform1fv', value: this.planetData.getData().noiseLayers.map(layer => layer.maskMultiplier)},
        {name: 'layerOctaves',        type: 'uniform1iv', value: this.planetData.getData().noiseLayers.map(layer => layer.octaves)},
        {name: 'layerPersistance',    type: 'uniform1fv', value: this.planetData.getData().noiseLayers.map(layer => layer.persistance)},
        {name: 'layerLacunarity',     type: 'uniform1fv', value: this.planetData.getData().noiseLayers.map(layer => layer.lacunarity)},
        {name: 'layerExponent',       type: 'uniform1iv', value: this.planetData.getData().noiseLayers.map(layer => layer.exponent)},
      ]
    }

    return shader
  }
}