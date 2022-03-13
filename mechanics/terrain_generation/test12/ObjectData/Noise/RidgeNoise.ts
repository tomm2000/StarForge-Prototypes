import { getDefaultPositionShaderVertex, positionShader } from "../positionShader";
import { noise3D } from "../../lib/GlslNoise";
import { GPUSpecs, NoiseController } from "../NoiseController";
import { BasicNoise } from "./BasicNoise";
import { texture_unifomrs } from "../../lib/GlslSnippets";

export class RidgeNoise extends BasicNoise {

  constructor(gpuSpecs: GPUSpecs | undefined = undefined, controller: NoiseController, index: number) {
    super(gpuSpecs, controller, index)

    this._noiseType = 'ridge'
  } 

  protected getPositionShader(): positionShader {
    return getDefaultPositionShaderVertex(FRAGMENT_SOURCE)
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
  float elevation_mask = 1.0;

  vec3 p = vec3(0.0);
  vec3 g;
  float alpha = 1.0 * float(seed);

  for(int i = 0; i < MAX_OCTAVES; i++) {
    if(i >= octaves) { break; }

    vec3 v = position.xyz * oct_frequency;

    float layer = (1.0 - abs(psrdnoise(v, p, alpha, g)));

    layer *= elevation_mask;
    elevation_mask = layer;

    total_elevation += layer * oct_amplitude;

    oct_frequency *= lacunarity;
    oct_amplitude *= persistance;
  }

  vec3 pos = position.xyz;

  for(int i = 0; i < MAX_EXPONENT; i++) {
    if(i >= exponent - 1) { break; }

    total_elevation *= total_elevation;
  }

  if(mantain_sign == 1) {
    total_elevation *= sign(amplitude);
  }

  gl_FragColor = vec4(
    0.0, 0.0,
    total_elevation,
    total_elevation + prev_elevation.a
  );
}
`