import { getDefaultPositionShaderVertex, positionShader } from "../positionShader";
import { noise3D } from "../../lib/GlslNoise";
import { GPUSpecs, NoiseController } from "../NoiseController";
import { BasicNoise } from "./BasicNoise";
import { texture_unifomrs } from "../../lib/GlslSnippets";
import { GPGPUuniform } from "../../lib/GPGPU";
import { GUI } from "dat.gui";
import { NoiseLayer, NoiseLayerData } from "./NoiseLayer";

export class MaskNoise extends BasicNoise {
  protected verticalShift: number = 0
  protected floor: number = 0
  protected ceiling: number = 1

  constructor(gpuSpecs: GPUSpecs | undefined = undefined, controller: NoiseController, index: number) {
    super(gpuSpecs, controller, index)

    this._noiseType = 'mask'
  } 

  protected getPositionShader(): positionShader {
    return getDefaultPositionShaderVertex(FRAGMENT_SOURCE)
  }

  protected getUniforms(): GPGPUuniform[] {
    return [
      ...super.getUniforms(),
      {type: 'uniform1f', name: 'vertical_shift', value: this.verticalShift},
      {type: 'uniform1f', name: 'ffloor', value: this.floor},
      {type: 'uniform1f', name: 'ceiling', value: this.ceiling},
    ]
  }

  generateGui(gui: GUI): GUI {
    gui = super.generateGui(gui)

    gui.add(this, 'verticalShift', -2, 2, 0.01)
    gui.add(this, 'floor', -2, 2, 0.1)
    gui.add(this, 'ceiling', -2, 2, 0.1)

    return gui
  }

  getJson(): NoiseLayerData {
    const { verticalShift, floor, ceiling } = this

    return {
      ...super.getJson(),
      verticalShift, floor, ceiling
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

uniform float ffloor;
uniform float ceiling;
uniform float vertical_shift;

uniform int is_masked;
uniform int mask_only;

${texture_unifomrs}

${noise3D}

const int MAX_OCTAVES = 32;
const int MAX_EXPONENT = 8;

void main() {
  vec4 position = texture2D(position_texture, vTextureCoord);
  vec4 prev_elevation = texture2D(elevation_texture, vTextureCoord);

//NOTE: all the elevation values start from 1 instead of 0! subract 1 for masks!
  float total_elevation = 0.0;
  float oct_amplitude = amplitude * 2.0;
  float oct_frequency = frequency;

  vec3 p = vec3(0.0);
  vec3 g;
  float alpha = 1.0 * float(seed);

  for(int i = 0; i < MAX_OCTAVES; i++) {
    if(i >= octaves) { break; }

    vec3 v = position.xyz * oct_frequency;

    total_elevation += (0.5 + 0.5 * psrdnoise(v, p, alpha, g)) * oct_amplitude;

    oct_frequency *= lacunarity;
    oct_amplitude *= persistance;
  }

  vec3 pos = position.xyz;

  for(int i = 0; i < MAX_EXPONENT; i++) {
    if(i >= exponent - 1) { break; }

    total_elevation *= total_elevation;
  }

  if(is_masked == 1) {
    vec4 mask_elevation = texture2D(mask_texture, vTextureCoord);
    total_elevation *= mask_elevation.b;
  }

  total_elevation += vertical_shift;

  total_elevation = min(total_elevation, ceiling);
  total_elevation = max(ffloor, total_elevation);

  float output_elevation = prev_elevation.a;
  if(mask_only == 0) { output_elevation += total_elevation; }

  gl_FragColor = vec4(
    0.0, 0.0,
    total_elevation,
    output_elevation
  );
}
`