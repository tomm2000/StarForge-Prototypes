import { Vector3 } from "babylonjs";
import { GUI } from "dat.gui";
import { noise3D } from "../../lib/GlslNoise";
import { texture_uniforms } from "../../lib/GlslSnippets";
import { GPGPUuniform } from "../../lib/GPGPU";
import { getDefaultPositionShaderVertex, positionShader } from "../misc/positionShader";
import { GPUSpecs, NoiseController } from "../planet_data/NoiseController";
import { NoiseLayer } from "./NoiseLayer";

export class CraterNoise extends NoiseLayer {
  protected _properties = {
    ...super.properties,
    seed: Math.floor(Math.random() * 9999),
    crater_amount: 3,
  }
  protected get properties() { return this._properties }
  private crater_positions: number[] = []
  private crater_sizes: number[] = []
  private crater_rims: number[] = []

  constructor(gpuSpecs: GPUSpecs | undefined = undefined, controller: NoiseController, index: number) {
    super(gpuSpecs, controller, index)

    this._noiseType = 'crater'
    this.generateCraters()
  } 

  protected getPositionShader(): positionShader {
    return getDefaultPositionShaderVertex(FRAGMENT_SOURCE)
  }

  generateGui(gui: GUI): GUI {
    gui = super.generateGui(gui)

    let g1 = gui.add(this.properties, 'crater_amount', 0, 8, 1)
    let g2 = gui.add(this.properties, 'seed', 0, 9999, 1)

    this.observeGUI(gui.add(craterTypes[0], 'crater_width' , 0.01,    1,  0.01), this.updateCraters.bind(this))
    this.observeGUI(gui.add(craterTypes[0], 'crater_height', -0.5,    1, 0.001), this.updateCraters.bind(this))
    this.observeGUI(gui.add(craterTypes[0], 'rim_steepness',    0,  0.5, 0.001), this.updateCraters.bind(this))
    this.observeGUI(gui.add(craterTypes[0], 'rim_offset'   ,    0,    1,  0.01), this.updateCraters.bind(this))
    this.observeGUI(gui.add(craterTypes[0], 'crater_floor' ,   -1,    1, 0.001), this.updateCraters.bind(this))
    this.observeGUI(gui.add(craterTypes[0], 'smoothness'   ,    0,    1, 0.001), this.updateCraters.bind(this))

    this.observeGUI(g1)
    this.observeGUI(g2)

    g1.onChange(this.generateCraters.bind(this))
    g2.onChange(this.generateCraters.bind(this))

    return gui
  }

  protected generateCraters() {
    for (let i = 0; i < this.properties.crater_amount; i++) {
      let pos = new Vector3(Math.random() * 2-1, Math.random() * 2-1, Math.random() * 2-1).normalize()
      pos.toArray(this.crater_positions, i * 3)

      let n = Math.floor(CraterNoise.biasFunction(Math.random(), 0.6) * craterTypes.length)

      this.crater_sizes[i*3+0] = CraterNoise.bellFunction(craterTypes[n].crater_floor , craterTypes[n].variation)
      this.crater_sizes[i*3+1] = CraterNoise.bellFunction(craterTypes[n].crater_height, craterTypes[n].variation)
      this.crater_sizes[i*3+2] = CraterNoise.bellFunction(craterTypes[n].crater_width , craterTypes[n].variation)

      this.crater_rims[i*3+0] = CraterNoise.bellFunction(craterTypes[n].rim_offset   , craterTypes[n].variation)
      this.crater_rims[i*3+1] = CraterNoise.bellFunction(craterTypes[n].rim_steepness, craterTypes[n].variation)
      this.crater_rims[i*3+2] = CraterNoise.bellFunction(craterTypes[n].smoothness   , craterTypes[n].variation)
    }
  }

  protected updateCraters() {
    for (let i = 0; i < this.properties.crater_amount; i++) {
      let n = Math.floor(CraterNoise.biasFunction(Math.random(), 0.6) * craterTypes.length)

      this.crater_sizes[i*3+0] = CraterNoise.bellFunction(craterTypes[n].crater_floor , craterTypes[n].variation)
      this.crater_sizes[i*3+1] = CraterNoise.bellFunction(craterTypes[n].crater_height, craterTypes[n].variation)
      this.crater_sizes[i*3+2] = CraterNoise.bellFunction(craterTypes[n].crater_width , craterTypes[n].variation)

      this.crater_rims[i*3+0] = CraterNoise.bellFunction(craterTypes[n].rim_offset   , craterTypes[n].variation)
      this.crater_rims[i*3+1] = CraterNoise.bellFunction(craterTypes[n].rim_steepness, craterTypes[n].variation)
      this.crater_rims[i*3+2] = CraterNoise.bellFunction(craterTypes[n].smoothness   , craterTypes[n].variation)
    }
  }

  protected static biasFunction(x: number, bias: number): number {
    if(x > 1 || x < 0) throw new Error('x must be between 0 and 1')
    let k = Math.pow(1-bias, 3)
    return (x * k) / (x * k - x + 1)
  }

  protected static bellFunction(base: number, variation: number): number {
    let k = 1 - Math.pow(2 * Math.random() - 1, 4)

    let min = base - base * variation
    let max = base + base * variation

    let delta = max - min
    let x = min + delta * k
    return x
  }

  protected getUniforms(): GPGPUuniform[] {
    return [
      ...super.getUniforms(),
      {type: 'uniform1fv', name: 'crater_positions' , value: this.crater_positions },
      {type: 'uniform1fv', name: 'crater_sizes' , value: this.crater_sizes },
      {type: 'uniform1fv', name: 'crater_rims' , value: this.crater_rims },
      {type: 'uniform1i',  name: 'crater_amount' , value: this.properties.crater_amount },
    ]
  }
}

type bell = { min: number, max: number }

type craterType = {
  variation: number,
  crater_width  : number,
  crater_height : number,
  rim_steepness : number,
  rim_offset    : number,
  crater_floor  : number,
  smoothness    : number,
}

const craterTypes: craterType[] = [
{
  variation: 0.1,
  crater_width  : 0.11,
  crater_height : 0.13,
  crater_floor  : -0.05,
  rim_steepness : 0.364,
  rim_offset    : 0.52,
  smoothness    : 0.112,
},
// {
//   crater_width  : { min: 0.2, max: 0.3 },
//   crater_height : { min: 0.2, max: 0.3 },
//   rim_steepness : { min: 0.2, max: 0.3 },
//   rim_offset    : { min: 0.2, max: 0.3 },
//   crater_floor  : { min: 0.2, max: 0.3 },
//   smoothness    : { min: 0.2, max: 0.3 },
// },
// {
//   crater_width  : { min: 0.4, max: 0.5 },
//   crater_height : { min: 0.4, max: 0.5 },
//   rim_steepness : { min: 0.4, max: 0.5 },
//   rim_offset    : { min: 0.4, max: 0.5 },
//   crater_floor  : { min: 0.4, max: 0.5 },
//   smoothness    : { min: 0.4, max: 0.5 },
// }
]

const FRAGMENT_SOURCE = /*glsl*/`
precision highp float;
const int MAX_CRATERS = 8;

uniform int is_masked;
uniform int mask_only;

uniform float crater_rims[MAX_CRATERS * 3];
uniform float crater_positions[MAX_CRATERS * 3];
uniform float crater_sizes[MAX_CRATERS * 3];

uniform int crater_amount;


${texture_uniforms}

${noise3D}

float smoothMin(float a, float b, float k) {
  float h = clamp((b - a + k) / (2.0 * k), 0.0, 1.0);
  return a * h + b * (1.0 - h) - k * h * (1.0 - h);
}

float smoothMax(float a, float b, float k) {
  float mk = -k;
  float h = clamp((b - a + mk) / (2.0 * mk), 0.0, 1.0);
  return a * h + b * (1.0 - h) - mk * h * (1.0 - h);
}

void main() {
  vec3 position = texture2D(position_texture, vTextureCoord).xyz;
  vec4 prev_elevation = texture2D(elevation_texture, vTextureCoord);

  float total_elevation = 0.0;

  for(int i = 0; i < MAX_CRATERS; i++) {
    float crater_floor = crater_sizes[i*3+0];
    float crater_height = crater_sizes[i*3+1];
    float crater_width = crater_sizes[i*3+2];

    float rim_offset = crater_rims[i*3+0];
    float rim_steepness = crater_rims[i*3+1];
    float smoothness = crater_rims[i*3+2];

    vec3 center = vec3(
      crater_positions[i * 3 + 0],
      crater_positions[i * 3 + 1],
      crater_positions[i * 3 + 2]
    );

    if(i >= crater_amount) break;

    float x = length(position - center) / crater_width; 

    float cavity = (x * x - 1.0) * crater_height;
    float rimX = min(x - 1.0 - rim_offset, 0.0);
    float rim = rim_steepness * rimX * rimX;

    float crater_shape = smoothMax(cavity, crater_floor, smoothness / 2.0); 
    crater_shape = smoothMin(crater_shape, rim, smoothness);

    total_elevation += crater_shape;
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