import { GUI } from "dat.gui";
import { getDefaultPositionShader, getDefaultPositionShaderVertex, positionShader } from "./positionShader";
import { noise3D } from "../../lib/GlslNoise";
import { GPGPUuniform } from "../../lib/GPGPU";
import { PlanetData } from "../PlanetData";
import { GPUSpecs, NoiseLayer } from "./NoiseType";
import { NoiseController } from "./NoiseController";

export class BasicNoise extends NoiseLayer {
  private amplitude: number = 1
  private frequency: number = 1
  private octaves: number = 1
  private persistance: number = 0.5
  private lacunarity: number = 2

  constructor(gpuSpecs: GPUSpecs | undefined = undefined, controller: NoiseController, index: number) {
    super(gpuSpecs, controller, index)

    this._noiseType = 'basic'
  } 

  protected getPositionShader(): positionShader {
    return getDefaultPositionShaderVertex(FRAGMENT_SOURCE)
  }

  protected getUniforms(): GPGPUuniform[] {
    return [
      ...super.getUniforms(),
      {type: 'uniform1f', name: 'amplitude', value: this.amplitude},
      {type: 'uniform1f', name: 'frequency', value: this.frequency},
      {type: 'uniform1i', name: 'octaves', value: this.octaves},
      {type: 'uniform1f', name: 'persistance', value: this.persistance},
      {type: 'uniform1f', name: 'lacunarity', value: this.lacunarity},
    ]
  }

  generateGui(gui: GUI): GUI {
    gui = super.generateGui(gui)

    gui.add(this, 'amplitude', -1, 1, 0.01)
    gui.add(this, 'frequency', 0.1, 5, 0.01)
    gui.add(this, 'octaves', 1, 10, 1)
    gui.add(this, 'persistance', 0.1, 1, 0.001)
    gui.add(this, 'lacunarity', 0.1, 3, 0.1)

    return gui
  }
}

const FRAGMENT_SOURCE = /*glsl*/`
precision highp float;

uniform float amplitude;
uniform float frequency;
uniform int octaves;
uniform float persistance;
uniform float lacunarity;
uniform int seed;

uniform sampler2D texture0; // elevation (/,/,prev,tot)
uniform sampler2D texture1; // position
varying vec2 vTextureCoord;

${noise3D}

const int MAX_OCTAVES = 32;

void main() {
  //---- restoring data from [0,1] -> [0,2] -> [-1,1] ----
  vec4 position = texture2D(texture1, vTextureCoord);
  vec4 prev_elevation = texture2D(texture0, vTextureCoord);
  //------------------------------------------------------

//NOTE: all the elevation values start from 1 instead of 0! subract 1 for masks!
  float total_elevation = 0.0;
  float oct_amplitude = amplitude;
  float oct_frequency = frequency;

  vec3 p = vec3(0.0);
  vec3 g;
  float alpha = 1.0 * float(seed);

  for(int i = 0; i < MAX_OCTAVES; i++) {
    if(i >= octaves) { break; }

    vec3 v = position.xyz * oct_frequency;

    total_elevation += psrdnoise(v, p, alpha, g) * oct_amplitude;

    oct_frequency *= lacunarity;
    oct_amplitude *= persistance;
  }

  //---- normalizing data from [-1,1] -> [0,2] -> [0,1] ----
  vec3 pos = position.xyz;
  //--------------------------------------------------------

  gl_FragColor = vec4(
    0.0, 0.0,
    total_elevation,
    total_elevation + prev_elevation.a
  );
}
`