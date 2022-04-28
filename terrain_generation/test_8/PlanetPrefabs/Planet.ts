import { GUI } from "dat.gui";
import { Material, Mesh, RawTexture, Scene, StandardMaterial, Texture, Vector2 } from "babylonjs";
import { getPlanetGUI } from "../GUI/SpaceObjectGUI";
import { PlanetData } from "../ObjectData/PlanetData";
import { PlanetPrefab } from './PlanetPrefab'
import { noise3D } from "../lib/GlslNoise";
import { SphereMesh } from "../Sphere/SphereMesh";
import { makeNoise3D } from "open-simplex-noise";
import { uvToCube } from "../Sphere/CubeTexture";

export class Planet implements PlanetPrefab  {
  sphereMesh: SphereMesh
  planetData: PlanetData
  gui: GUI
  private autoUpdate: boolean = false
  private updateInterval: NodeJS.Timer | undefined
  private scene: Scene;
  private material: StandardMaterial

  constructor(scene: Scene, radius: number = 1) {
    const seed = Math.floor(Math.random()*9999)
    this.scene = scene;
    this.material = new StandardMaterial('material')
    this.material.diffuseTexture = this.generateHeightMap()

    this.planetData = {
      globalMinHeight: 0,
      radius,
      seed,
      type: "terrestrial",
      noiseLayers: [],
      debugNoise: false
    }

    this.gui = getPlanetGUI(this.planetData, this)

    this.sphereMesh = new SphereMesh(this.scene, undefined, undefined, undefined, this.material)

    this.updateInterval = setInterval(() => {
      if(this.autoUpdate) {
        this.reload()
      }
    }, 16)
  }

  reload() {
    // this.icoSphereMesh.setPositionShader(this.getPositionShader())
    // this.icoSphereMesh.updateMesh()
    (this.sphereMesh.getMaterial() as StandardMaterial).diffuseTexture = this.generateHeightMap()
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

  dispose() {
    if(this.updateInterval) { clearInterval(this.updateInterval) }
    this.sphereMesh.dispose()
    this.gui.destroy()
  }

  // getPositionShader(): positionShader {
  //   const fs = /*glsl*/`
  //     precision highp float;

  //     #define MAX_LAYERS 32

  //     uniform float radius;
  //     uniform float debugNoise;
  //     uniform float layerAmount;

  //     uniform float layerAmplitude[32];
  //     uniform float layerUsePrev[32];
  //     uniform float layerUseFirst[32];
  //     uniform float layerMaskOnly[32];
  //     uniform float layerDetail[32];
  //     uniform float layerMinHeight[32];

  //     uniform sampler2D texture;
  //     varying vec2 vTextureCoord;

  //     ${noise3D}

  //     void main() {
  //       // restoring data from [0,1] -> [0,2] -> [-1,1]
  //       vec4 position = (texture2D(texture, vTextureCoord) * 2.0) - 1.0;

  //       float elevation = 1.0;
  //       float base_elevation = 1.0;
  //       float prev_elevation = 1.0;

  //       for(int i = 0; i < MAX_LAYERS; i++) {
  //         if(float(i) >= layerAmount) { break; }

  //         vec3 v = layerDetail[i] * position.xyz;
  //         vec3 p = vec3(0.0);
  //         vec3 g;
  //         float alpha = 1.0;
          
  //         float level_elevation = 0.5 + 0.5 * psrdnoise(v, p, alpha, g);

  //         level_elevation = (level_elevation + 1.0) / 2.0 * layerAmplitude[i];
  //         level_elevation = max(0.0, level_elevation - layerMinHeight[i]);

  //         float mask = 1.0;

  //         if(layerUseFirst[i] == 1.0) {  mask = base_elevation; }

  //         if(i == 0) { base_elevation = level_elevation; }

  //         if(layerUsePrev[i] == 1.0 && i >= 1) { mask = prev_elevation; }

  //         if(layerMaskOnly[i] == 0.0) {
  //           prev_elevation = level_elevation * mask;
  //           elevation += level_elevation * mask;
  //         } else {
  //           prev_elevation = (level_elevation * mask) == 0.0 ? 0.0 : 0.5;

  //           if(debugNoise == 1.0){
  //             elevation += (level_elevation * mask) == 0.0 ? 0.0 : 0.5; //* for debugging noise only!
  //           }
  //         }
  //       }

  //       // normalizing data from [-1,1] -> [0,2] -> [0,1]
  //       vec3 pos = (position.xyz + 1.0) / 2.0;

  //       gl_FragColor = vec4(pos, 1.0 / (elevation * radius));
  //     }
  //   `

  //   const shader: positionShader = getDefaultPositionShaderVertex(fs)

  //   this.planetData.radius
  //   this.planetData.debugNoise ? 1 : 0
  //   this.planetData.noiseLayers.length
  //   this.planetData.noiseLayers.map(layer => layer.amplitude)
  //   this.planetData.noiseLayers.map(layer => layer.usePrevLayerAsMask  ? 1 : 0)
  //   this.planetData.noiseLayers.map(layer => layer.useFirstLayerAsMask ? 1 : 0)
  //   this.planetData.noiseLayers.map(layer => layer.maskOnly ? 1 : 0)
  //   this.planetData.noiseLayers.map(layer => layer.detail)
  //   this.planetData.noiseLayers.map(layer => layer.minHeight)

  //   shader.uniforms = [
  //     {name: 'radius'        , value: this.planetData.radius},
  //     {name: 'debugNoise'    , value: this.planetData.debugNoise ? 1 : 0},
  //     {name: 'layerAmount'   , value: this.planetData.noiseLayers.length},
  //     {name: 'layerAmplitude', value: this.planetData.noiseLayers.map(layer => layer.amplitude)},
  //     {name: 'layerUsePrev'  , value: this.planetData.noiseLayers.map(layer => layer.usePrevLayerAsMask  ? 1 : 0)},
  //     {name: 'layerUseFirst' , value: this.planetData.noiseLayers.map(layer => layer.useFirstLayerAsMask ? 1 : 0)},
  //     {name: 'layerMaskOnly' , value: this.planetData.noiseLayers.map(layer => layer.maskOnly ? 1 : 0)},
  //     {name: 'layerDetail'   , value: this.planetData.noiseLayers.map(layer => layer.detail)},
  //     {name: 'layerMinHeight', value: this.planetData.noiseLayers.map(layer => layer.minHeight)}
  //   ]

  //   return shader
  // }

  generateHeightMap(): Texture {
    const textureSize = new Vector2(300, 200)
    const textureData = new Uint8Array(textureSize.x*textureSize.y*4)
    const noise = makeNoise3D(Math.random() * 999)

    for(let i = 0; i < textureSize.x * textureSize.y; i++) {
      const pos = new Vector2(i % textureSize.x, Math.floor(i / textureSize.x))

      const {position, normal} = uvToCube(pos.divide(textureSize))

      const elevation = (noise(position.x * 4, position.y * 4, position.z * 4) + 1) / 2

      textureData[i*3+0] = /*Math.abs(normal.x) * 255*/ /*((position.x + 1) / 2) * 256 */ elevation * 256
      textureData[i*3+1] = /*Math.abs(normal.y) * 255*/ /*((position.y + 1) / 2) * 256 */ elevation * 256
      textureData[i*3+2] = /*Math.abs(normal.z) * 255*/ /*((position.z + 1) / 2) * 256 */ elevation * 256
    }

    return RawTexture.CreateRGBTexture(textureData, textureSize.x, textureSize.y, this.scene)
    // return new Texture('http://localhost:3001/images/testcube')
  }
}

    