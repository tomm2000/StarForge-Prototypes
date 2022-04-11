import { getDefaultPositionShaderVertex, positionShader } from "../misc/positionShader";
import { noise3D } from "../../lib/GlslNoise";
import { GPUSpecs, NoiseController } from "../planet_data/NoiseController";
import { BasicNoise } from "./BasicNoise";
import { texture_unifomrs } from "../../lib/GlslSnippets";
import { GPGPUuniform } from "../../lib/GPGPU";
import { GUI } from "dat.gui";
import { NoiseLayer } from "./NoiseLayer";

export class MaskNoise extends BasicNoise {
  protected _properties = {
    ...super.properties,
    vertical_shift: 0,
    floor: 0,
    ceiling: 1
  }
  protected get properties() { return this._properties }

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
      {type: 'uniform1f', name: 'vertical_shift', value: this.properties.vertical_shift},
      {type: 'uniform1f', name: 'ffloor', value: this.properties.floor},
      {type: 'uniform1f', name: 'ceiling', value: this.properties.ceiling},
    ]
  }

  generateGui(gui: GUI): GUI {
    gui = super.generateGui(gui)

    this.observeGUI(gui.add(this.properties, 'vertical_shift', -2, 2, 0.01))
    this.observeGUI(gui.add(this.properties, 'floor', -2, 2, 0.1))
    this.observeGUI(gui.add(this.properties, 'ceiling', -2, 2, 0.1))

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