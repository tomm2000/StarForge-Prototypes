import { GUI } from "dat.gui";
import { Mesh, Scene } from "babylonjs";
import { getPlanetGUI } from "../GUI/SpaceObjectGUI";
import { IcoSphereMesh } from "../IcoSphere/IcoSphereMesh";
import { PlanetData } from "../ObjectData/PlanetData";
import { PlanetPrefab } from './PlanetPrefab'

import { getDefaultPositionShader, getDefaultPositionShaderVertex, positionShader } from "../IcoSphere/positionShader";
import { noise3D } from "../lib/GlslNoise";

export class Terrestrial1 implements PlanetPrefab  {
  icoSphereMesh: IcoSphereMesh
  planetData: PlanetData
  gui: GUI
  private autoUpdate: boolean = false
  private updateInterval: NodeJS.Timer | undefined
  private scene: Scene;

  constructor(scene: Scene, radius: number = 1) {
    const seed = Math.floor(Math.random()*9999)
    this.scene = scene;

    this.planetData = {
      globalMinHeight: 0,
      radius,
      seed,
      type: "terrestrial",
      noiseLayers: [],
      debugNoise: false
    }

    this.gui = getPlanetGUI(this.planetData, this)

    this.icoSphereMesh = new IcoSphereMesh(this.scene, 32, this.getPositionShader())

    this.updateInterval = setInterval(() => {
      if(this.autoUpdate) {
        this.reload()
      }
    }, 16)
  }

  reload() {
    this.icoSphereMesh.setPositionShader(this.getPositionShader())
    this.icoSphereMesh.updateMesh()
  }
  
  addNoiseLayer(): void {
    const index = this.planetData.noiseLayers.length

    this.planetData.noiseLayers.push({
      removeSelf: () => {
        this.planetData.noiseLayers.splice(index, 1)
        this.updateGUI()
      },
      amplitude: 1,
      minHeight: 0,
      useFirstLayerAsMask: false,
      usePrevLayerAsMask: false,
      maskOnly: false,
      detail: 1,
      index: index
    })

    this.updateGUI()
  }

  updateGUI() {
    this.gui.destroy()
    this.gui = getPlanetGUI(this.planetData, this)
  }
  
  getMesh(): Mesh { return this.icoSphereMesh.getMesh() }

  dispose() {
    if(this.updateInterval) { clearInterval(this.updateInterval) }
    this.icoSphereMesh.dispose()
    this.gui.destroy()
  }

  getPositionShader(): positionShader {
    const fs = /*glsl*/`
      precision highp float;

      #define MAX_LAYERS 32

      uniform float radius;
      uniform float debugNoise;
      uniform float layerAmount;

      uniform float layerAmplitude[MAX_LAYERS];
      uniform float layerUsePrev[MAX_LAYERS];
      uniform float layerUseFirst[MAX_LAYERS];
      uniform float layerMaskOnly[MAX_LAYERS];
      uniform float layerDetail[MAX_LAYERS];
      uniform float layerMinHeight[MAX_LAYERS];

      uniform sampler2D texture;
      varying vec2 vTextureCoord;

      ${noise3D}

      void main() {
        // restoring data from [0,1] -> [0,2] -> [-1,1]
        vec4 position = (texture2D(texture, vTextureCoord) * 2.0) - 1.0;

        float elevation = 1.0;
        float base_elevation = 1.0;
        float prev_elevation = 1.0;

        for(int i = 0; i < MAX_LAYERS; i++) {
          if(float(i) >= layerAmount) { break; }

          vec3 v = layerDetail[i] * position.xyz;
          vec3 p = vec3(0.0);
          vec3 g;
          float alpha = 1.0;
          
          float level_elevation = 0.5 + 0.5 * psrdnoise(v, p, alpha, g);

          level_elevation = (level_elevation + 1.0) / 2.0 * layerAmplitude[i];
          level_elevation = max(0.0, level_elevation - layerMinHeight[i]);

          float mask = 1.0;

          if(layerUseFirst[i] == 1.0) {  mask = base_elevation; }

          if(i == 0) { base_elevation = level_elevation; }

          if(layerUsePrev[i] == 1.0 && i >= 1) { mask = prev_elevation; }

          if(layerMaskOnly[i] == 0.0) {
            prev_elevation = level_elevation * mask;
            elevation += level_elevation * mask;
          } else {
            prev_elevation = (level_elevation * mask) == 0.0 ? 0.0 : 0.5;

            if(debugNoise == 1.0){
              elevation += (level_elevation * mask) == 0.0 ? 0.0 : 0.5; //* for debugging noise only!
            }
          }
        }

        // normalizing data from [-1,1] -> [0,2] -> [0,1]
        vec3 pos = (position.xyz + 1.0) / 2.0;

        gl_FragColor = vec4(pos, 1.0 / (elevation * radius));
        // gl_FragColor = vec4(pos, 1.0 / layerAmplitude[0]);
      }
    `

    const shader: positionShader = getDefaultPositionShaderVertex(fs)

    shader.uniforms = [
      {name: 'radius'        , type: 'uniform1f' , value: this.planetData.radius},
      {name: 'debugNoise'    , type: 'uniform1f' , value: this.planetData.debugNoise ? 1 : 0},
      {name: 'layerAmount'   , type: 'uniform1f', value: this.planetData.noiseLayers.length},
    ]

    if(this.planetData.noiseLayers.length > 0) {
      shader.uniforms = shader.uniforms.concat([
        {name: 'layerAmplitude', type: 'uniform1fv', value: this.planetData.noiseLayers.map(layer => layer.amplitude)},
        {name: 'layerUsePrev'  , type: 'uniform1fv', value: this.planetData.noiseLayers.map(layer => layer.usePrevLayerAsMask  ? 1 : 0)},
        {name: 'layerUseFirst' , type: 'uniform1fv', value: this.planetData.noiseLayers.map(layer => layer.useFirstLayerAsMask ? 1 : 0)},
        {name: 'layerMaskOnly' , type: 'uniform1fv', value: this.planetData.noiseLayers.map(layer => layer.maskOnly ? 1 : 0)},
        {name: 'layerDetail'   , type: 'uniform1fv', value: this.planetData.noiseLayers.map(layer => layer.detail)},
        {name: 'layerMinHeight', type: 'uniform1fv', value: this.planetData.noiseLayers.map(layer => layer.minHeight)}
      ])
    }

    // console.log(shader.uniforms)

    return shader
  }
}