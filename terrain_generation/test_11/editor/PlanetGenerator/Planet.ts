import { Scene } from "babylonjs";
import { getDefaultPositionShaderVertex, positionShader } from "../../common/IcoSphere/positionShader";
import { basicNoiseLayer, maskNoiseLayer, noise3D, positiveNoiseLayer, ridgeNoiseLayer } from "../../common/lib/GlslNoise";
import { setNMInputValue } from "../../common/lib/nodeMaterial";
import { PlanetData } from "./PlanetData";
import { BasePlanet } from "./BasePlanet";


export class Planet extends BasePlanet {
  constructor(scene: Scene, planetData: PlanetData = new PlanetData()) {
    super(scene, planetData);
  }

  updateMaterialNodes(): void {
    const material = this.icoSphereMesh.getMaterial()
    setNMInputValue(material, 'INheightMultiplier', this.planetData.getData().materialHeightMultiplier)
    setNMInputValue(material, 'INseaLevel',         this.planetData.getData().waterLevel)
    setNMInputValue(material, 'INminHeight',        this.icoSphereMesh.getMinHeight())
    setNMInputValue(material, 'INmaxHeight',        this.icoSphereMesh.getMaxHeight())
  }

  getPositionShader(): positionShader {
    const FRAGMENT_SOURCE = /*glsl*/`
      precision highp float;

      #define MAX_LAYERS 32

      uniform float radius;
      uniform int debugNoise;
      uniform int layerAmount;
      uniform int seed;
      uniform float waterLevel;
      uniform float oceanDepth;
      uniform float oceanFloor;

      //* integers
      uniform int   layerPrevMask [MAX_LAYERS];
      uniform int   layerFirstMask[MAX_LAYERS];
      uniform int   layerMaskOnly [MAX_LAYERS];
      uniform int   layerNoiseType[MAX_LAYERS];
      uniform int   layerOctaves  [MAX_LAYERS];
      uniform int   layerExponent [MAX_LAYERS];

      //* floats
      uniform float layerAmplitude     [MAX_LAYERS];
      uniform float layerScale         [MAX_LAYERS];
      uniform float layerMinHeight     [MAX_LAYERS];
      uniform float layerMaskMultiplier[MAX_LAYERS];
      uniform float layerLacunarity    [MAX_LAYERS];
      uniform float layerPersistance   [MAX_LAYERS];

      uniform sampler2D texture;
      varying vec2 vTextureCoord;

      ${noise3D}

      ${basicNoiseLayer}
      ${positiveNoiseLayer}
      ${ridgeNoiseLayer}
      ${maskNoiseLayer}

      void main() {
        // restoring data from [0,1] -> [0,2] -> [-1,1]
        vec4 position = (texture2D(texture, vTextureCoord) * 2.0) - 1.0;

        float elevation = 0.0;
        float base_elevation = 0.0;
        float prev_elevation = 0.0;

        for(int i = 0; i < MAX_LAYERS; i++) {
          if(i >= layerAmount) { break; }

          // ---- mask setup
          float mask = 0.0;

          if(layerPrevMask[i] == 0 && layerFirstMask[i] == 0) { 
            mask = 1.0;
          }

          if       (layerPrevMask[i] ==  1) {
            mask = prev_elevation;
          } else if(layerPrevMask[i] == -1) {
            mask = 1.0 - prev_elevation;
          }

          if       (layerFirstMask[i] ==  1 && i >= 1) {
            mask = base_elevation;
          } else if(layerFirstMask[i] == -1 && i >= 1) {
            mask = 1.0 - base_elevation;
          }
          // ---------------

          // ---- noise generation
          float level_elevation = 0.0;

          if(layerNoiseType[i] == 0) {
            level_elevation = basicNoiseLayer(layerMinHeight[i], layerAmplitude[i], layerScale[i], layerLacunarity[i], layerPersistance[i], layerOctaves[i], layerExponent[i], mask, position.xyz, seed + i);
          } else if(layerNoiseType[i] == 1) {
            level_elevation = positiveNoiseLayer(layerMinHeight[i], layerAmplitude[i], layerScale[i], layerLacunarity[i], layerPersistance[i], layerOctaves[i], layerExponent[i], mask, position.xyz, seed + i);
          } else if(layerNoiseType[i] == 2) {
            level_elevation = ridgeNoiseLayer(layerMinHeight[i], layerAmplitude[i], layerScale[i], layerLacunarity[i], layerPersistance[i], layerOctaves[i], layerExponent[i], mask, position.xyz, seed + i);
          } else if(layerNoiseType[i] == 3) {
            level_elevation = maskNoiseLayer(layerMinHeight[i], layerAmplitude[i], layerScale[i], position.xyz, seed + i);
          }
          // ---------------------

          // ---- mask and elevation finalization
          if(i == 0) { base_elevation = level_elevation * layerMaskMultiplier[i]; }
          prev_elevation = level_elevation * mask * layerMaskMultiplier[i];

          if(layerMaskOnly[i] == 0) { elevation += level_elevation * mask; }
          // ------------------------------------
        }

        if(elevation < 0.0) {
          elevation *= oceanDepth;
        }

        if(elevation <= oceanFloor) {
          float extra_elevation = oceanFloor - elevation;

          elevation += extra_elevation;

          extra_elevation /= 5.0;

          elevation -= extra_elevation;
        }

        elevation += 1.0;

        // normalizing data from [-1,1] -> [0,2] -> [0,1]
        vec3 pos = (position.xyz + 1.0) / 2.0;

        gl_FragColor = vec4(pos, 1.0 / (elevation * radius));
        // gl_FragColor = vec4(pos, 1.0 / layerAmplitude[0]);
      }
    `

    const shader: positionShader = getDefaultPositionShaderVertex(FRAGMENT_SOURCE)

    return shader
  }
}