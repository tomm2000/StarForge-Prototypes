import { GUI } from "dat.gui";
import { getDefaultPositionShaderVertex, positionShader } from "../positionShader";
import { noise3D } from "../../lib/GlslNoise";
import { GPGPUuniform } from "../../lib/GPGPU";
import { NoiseLayer, NoiseLayerData } from "./NoiseLayer";
import { GPUSpecs, NoiseController, NoiseTypes } from "../NoiseController";
import { texture_unifomrs } from "../../lib/GlslSnippets";

export class BasicNoise extends NoiseLayer {
  protected amplitude: number = 1
  protected frequency: number = 1
  protected octaves: number = 1
  protected persistance: number = 0.5
  protected lacunarity: number = 2
  protected exponent: number = 1
  private mantain_sign: boolean = false
  protected seed: number = Math.floor(Math.random() * 9999)

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
      {type: 'uniform1i', name: 'exponent', value: this.exponent},
      {type: 'uniform1i', name: 'mantain_sign', value: this.mantain_sign ? 1 : 0},
      {type: 'uniform1i', name: 'seed', value: this.seed},
    ]
  }

  generateGui(gui: GUI): GUI {
    gui = super.generateGui(gui)

    gui.add(this, 'seed', 0, 9999, 1)
    gui.add(this, 'amplitude', -1, 1, 0.01)
    gui.add(this, 'frequency', 0.1, 5, 0.01)
    gui.add(this, 'octaves', 1, 10, 1)
    gui.add(this, 'persistance', 0.1, 1, 0.001)
    gui.add(this, 'lacunarity', 0.1, 3, 0.1)
    gui.add(this, 'exponent', 1, 6, 1)
    gui.add(this, 'mantain_sign')

    return gui
  }

  getJson(): NoiseLayerData {
    const { seed, amplitude, frequency, octaves, persistance, lacunarity, exponent, mantain_sign } = this
    
    return {
      ...super.getJson(),
      seed, amplitude, frequency, octaves, persistance, lacunarity, exponent, mantain_sign
    }
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
uniform int exponent;
uniform int mantain_sign;

uniform int is_masked;
uniform int mask_only;

${texture_unifomrs}

${noise3D}

const int MAX_OCTAVES  = 32;
const int MAX_EXPONENT = 8;

void main() {
  vec4 position = texture2D(position_texture, vTextureCoord);
  vec4 prev_elevation = texture2D(elevation_texture, vTextureCoord);

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

  vec3 pos = position.xyz;

  for(int i = 0; i < MAX_EXPONENT; i++) {
    if(i >= exponent - 1) { break; }

    total_elevation *= total_elevation;
  }

  if(mantain_sign == 1) { total_elevation *= sign(amplitude); }

  if(is_masked == 1) {
    vec4 mask_elevation = texture2D(mask_texture, vTextureCoord);
    total_elevation *= mask_elevation.b;
  }

  float output_elevation = prev_elevation.a;
  if(mask_only == 0) { output_elevation += total_elevation; }

  gl_FragColor = vec4(
    0.0, 0.0,
    total_elevation,
    output_elevation
  );
}
`