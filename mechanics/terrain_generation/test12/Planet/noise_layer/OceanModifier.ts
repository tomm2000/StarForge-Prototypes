import { GUI } from "dat.gui";
import { getDefaultPositionShader, getDefaultPositionShaderVertex, positionShader } from "../misc/positionShader";
import { noise3D } from "../../lib/GlslNoise";
import { GPGPUuniform } from "../../lib/GPGPU";
import { DataController } from "../planet_data/DataController";
import { NoiseLayer } from "./NoiseLayer";
import { GPUSpecs, NoiseController } from "../planet_data/NoiseController";
import { texture_unifomrs } from "../../lib/GlslSnippets";

export class OceanModifier extends NoiseLayer {
  public _properties = {
    ...super.properties,
    ocean_floor: 0,
    ocean_depth: 1,
    ocean_level: 1,
    floor_flatten: 5
  }
  protected get properties() { return this._properties }

  constructor(gpuSpecs: GPUSpecs | undefined = undefined, controller: NoiseController, index: number) {
    super(gpuSpecs, controller, index)

    this._noiseType = 'ocean_modifier'
  } 

  protected getPositionShader(): positionShader {
    return getDefaultPositionShaderVertex(FRAGMENT_SOURCE)
  }

  protected getUniforms(): GPGPUuniform[] {
    return [
      ...super.getUniforms(),
      {type: 'uniform1f', name: 'ocean_floor', value: this.properties.ocean_floor},
      {type: 'uniform1f', name: 'ocean_depth', value: this.properties.ocean_depth},
      {type: 'uniform1f', name: 'ocean_level', value: this.properties.ocean_level},
      {type: 'uniform1f', name: 'floor_flatten', value: this.properties.floor_flatten},
    ]
  }

  generateGui(gui: GUI): GUI {
    gui = super.generateGui(gui)

    console.log(super.properties)

    this.observeGUI(gui.add(this.properties, 'ocean_floor', -2, 2, 0.01))
    this.observeGUI(gui.add(this.properties, 'ocean_depth', 0.1, 5, 0.01))
    this.observeGUI(gui.add(this.properties, 'ocean_level', -2, 2, 0.01))
    this.observeGUI(gui.add(this.properties, 'floor_flatten', 1, 10, 0.1))

    return gui
  }
}

const FRAGMENT_SOURCE = /*glsl*/`
precision highp float;

uniform float ocean_floor;
uniform float ocean_depth;
uniform float ocean_level;
uniform float floor_flatten;

uniform int is_masked;

${texture_unifomrs}

${noise3D}

const int MAX_OCTAVES  = 32;
const int MAX_EXPONENT = 8;

void main() {
  vec4 position = texture2D(position_texture, vTextureCoord);
  vec4 prev_elevation = texture2D(elevation_texture, vTextureCoord);

  float total_elevation = prev_elevation.a;

  if(total_elevation <= ocean_level) {
    float depth = ocean_level - total_elevation;

    total_elevation += depth;

    depth *= ocean_depth;
    
    total_elevation -= depth;
  }

  if(total_elevation < ocean_floor) {
    float extra_depth = ocean_floor - total_elevation;

    total_elevation += extra_depth;
    
    extra_depth /= floor_flatten;

    total_elevation -= extra_depth;
  }
  
  if(is_masked == 1) {
    vec4 mask_elevation = texture2D(mask_texture, vTextureCoord);
    total_elevation *= mask_elevation.b;
  } 

  gl_FragColor = vec4(
    0.0, 0.0,
    total_elevation,
    total_elevation
  );
}
`