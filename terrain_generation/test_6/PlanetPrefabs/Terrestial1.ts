import { Effect, Material, Scene, ShaderMaterial } from 'babylonjs';
import { GUI } from 'dat.gui';
import { makeNoise3D } from 'open-simplex-noise';
import { Mesh, Vector3 } from 'babylonjs';
import { getPlanetGUI } from '../GUI/SpaceObjectGUI';
import { IcoSphereMesh } from '../IcoSphere/IcoSphereMesh';
import { NoiseData } from '../ObjectData/NoiseData';
import { PlanetData } from '../ObjectData/PlanetData';
import { PlanetPrefab } from './PlanetPrefab';
import { noise3D } from '../../test7/lib/GlslNoise';

export class Terrestrial1 implements PlanetPrefab {
  icoSphereMesh: IcoSphereMesh;
  planetData: PlanetData;
  gui: GUI;
  private autoUpdate: boolean = false;
  private updateInterval: NodeJS.Timer | undefined;
  private scene: Scene;
  private material: ShaderMaterial | undefined
  private position: Vector3

  constructor(scene: Scene, radius: number = 1, position: Vector3 = Vector3.Zero()) {
    const seed = Math.floor(Math.random() * 9999);
    this.scene = scene;
    this.position = position

    this.planetData = {
      globalMinHeight: 0,
      radius,
      seed,
      type: 'terrestrial',
      noiseLayers: [],
      debugNoise: false,
    };

    this.gui = getPlanetGUI(this.planetData, this);

    this.icoSphereMesh = new IcoSphereMesh(this.scene, 32, this.position);

    this.generateMaterial()

    if(this.material){
      this.icoSphereMesh.setMaterial(this.material)
    }

    this.updateInterval = setInterval(() => {
      if (this.autoUpdate) {
        this.reload();
      }
    }, 100);
  }

  reload() {
    // let material = this.getMaterial()
    this.material?.unfreeze()

    this.material?.setFloat('radius', this.planetData.radius)
    this.material?.setFloat('debugNoise', this.planetData.debugNoise ? 1 : 0)
    this.material?.setInt('layerAmount', this.planetData.noiseLayers.length)
    this.material?.setFloats('layerAmplitude' , this.planetData.noiseLayers.map(layer => layer.amplitude))
    this.material?.setFloats('layerUsePrev'   , this.planetData.noiseLayers.map(layer => layer.usePrevLayerAsMask  ? 1 : 0))
    this.material?.setFloats('layerUseFirst'  , this.planetData.noiseLayers.map(layer => layer.useFirstLayerAsMask ? 1 : 0))
    this.material?.setFloats('layerMaskOnly'  , this.planetData.noiseLayers.map(layer => layer.maskOnly ? 1 : 0))
    this.material?.setFloats('layerDetail'    , this.planetData.noiseLayers.map(layer => layer.detail))
    this.material?.setFloats('layerMinHeight' , this.planetData.noiseLayers.map(layer => layer.minHeight))

    this.material?.freeze()


    this.icoSphereMesh.updateMesh()
  }

  getMaterial(): ShaderMaterial {
    return this.material || this.generateMaterial()
  }

  generateMaterial(): ShaderMaterial {
    const vs = /*glsl*/`
    // precision highp float;

    attribute vec3 position;
    attribute vec2 uv;
    attribute vec3 normal;

    uniform mat4 worldViewProjection;
    uniform float radius;
    uniform float debugNoise;

    uniform int layerAmount;
    uniform float layerAmplitude[32];
    uniform float layerUsePrev[32];
    uniform float layerUseFirst[32];
    uniform float layerMaskOnly[32];
    uniform float layerDetail[32];
    uniform float layerMinHeight[32];

    // Varying
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec2 vUV;

    ${noise3D}

    void main() {
      float elevation = 1.0;
      float base_elevation = 1.0;
      float prev_elevation = 1.0;

      for(int i = 0; i < layerAmount; i++) {
        vec3 v = layerDetail[i] * position.xyz;
        vec3 p = vec3(0.0);
        vec3 g;
        float alpha = 1.0;
        
        float level_elevation = 0.5 + 0.5 * psrdnoise(v, p, alpha, g);

        level_elevation = (level_elevation + 1.0) / 2.0 * layerAmplitude[i];
        level_elevation = max(0.0, level_elevation - layerMinHeight[i]);

        float mask = 1.0;

        if(layerUseFirst[i] == 1.0) {
          mask = base_elevation;
        }

        if(i == 0) {
          base_elevation = level_elevation;
        }

        if(layerUsePrev[i] == 1.0 && i >= 1) {
          mask = prev_elevation;
        }

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

      vec4 pos = worldViewProjection * vec4(position * elevation * radius, 1.0);

      gl_Position = pos;

      vPosition = position;
      vNormal = normal;
    }
    `

    const fs = /*glsl*/`
      precision highp float;

      // Varying
      varying vec3 vPosition;
      varying vec3 vNormal;
      // varying vec2 vUV;

      // Uniforms
      uniform mat4 world;

      // Refs
      uniform vec3 cameraPosition;

      void main(void) {
        vec3 vLightPosition = vec3(0,20,20);
        
        // World values
        vec3 vPositionW = vec3(world * vec4(vPosition, 1.0));
        vec3 vNormalW = normalize(vec3(world * vec4(vNormal, 0.0)));
        vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
        
        // Light
        vec3 lightVectorW = normalize(vLightPosition - vPositionW);
        vec3 color = vec4(1.0, 0.0, 1.0, 1.0).rgb;
        
        // diffuse
        float ndl = max(0., dot(vNormalW, lightVectorW));
        
        // Specular
        vec3 angleW = normalize(viewDirectionW + lightVectorW);
        float specComp = max(0., dot(vNormalW, angleW));
        specComp = pow(specComp, max(1., 64.)) * 2.;
        
        gl_FragColor = vec4(color * ndl + vec3(specComp), 1.);

        // gl_FragColor = vec4(vNormal, 1.0);
      }
    `

    const material = new ShaderMaterial('material', this.scene, {
      vertexSource: vs,
      fragmentSource: fs
    }, {
      attributes: ['position', 'normal', 'uv'],
      uniforms: ['worldViewProjection', 'radius', 'layerAmplitude', 'layerAmount', 'cameraPosition', 'world'],
    });

    material.setFloat('radius', this.planetData.radius)
    material.setFloat('debugNoise', this.planetData.debugNoise ? 1 : 0)
    material.setInt('layerAmount', this.planetData.noiseLayers.length)
    material.setFloats('layerAmplitude' , this.planetData.noiseLayers.map(layer => layer.amplitude))
    material.setFloats('layerUsePrev'   , this.planetData.noiseLayers.map(layer => layer.usePrevLayerAsMask  ? 1 : 0))
    material.setFloats('layerUseFirst'  , this.planetData.noiseLayers.map(layer => layer.useFirstLayerAsMask ? 1 : 0))
    material.setFloats('layerMaskOnly'  , this.planetData.noiseLayers.map(layer => layer.maskOnly ? 1 : 0))
    material.setFloats('layerDetail'    , this.planetData.noiseLayers.map(layer => layer.detail))
    material.setFloats('layerMinHeight' , this.planetData.noiseLayers.map(layer => layer.minHeight))

    this.material = material
    this.material.freeze()
    return material
  }

  addNoiseLayer(): void {
    const index = this.planetData.noiseLayers.length;

    this.planetData.noiseLayers.push({
      noise: makeNoise3D(this.planetData.seed),
      removeSelf: () => {
        this.planetData.noiseLayers.splice(index, 1);
        this.updateGUI();
      },
      amplitude: 1,
      minHeight: 0,
      useFirstLayerAsMask: false,
      usePrevLayerAsMask: false,
      maskOnly: false,
      detail: 1,
      index: index,
    });

    this.updateGUI();
  }

  updateGUI() {
    this.gui.destroy();
    this.gui = getPlanetGUI(this.planetData, this);
  }

  getMesh(): Mesh {
    return this.icoSphereMesh.getMesh();
  }

  dispose() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.icoSphereMesh.dispose()
    this.gui.destroy()
    this.material?.dispose()
  }
}
