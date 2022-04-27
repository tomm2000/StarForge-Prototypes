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
    crater_min: 0,
    crater_max: craterTypes.length-1,
    size_distribution: 0.2
  }
  protected get properties() { return this._properties }
  private crater_positions: number[] = []
  private crater_sizes: number[] = []
  private crater_rims: number[] = []

  constructor(gpuSpecs: GPUSpecs | undefined = undefined, controller: NoiseController, index: number) {
    super(gpuSpecs, controller, index)

    this._noiseType = 'crater'
  }

  protected init() {
    super.init()
    this.generateCraters()
  }

  protected getPositionShader(): positionShader {
    return getDefaultPositionShaderVertex(FRAGMENT_SOURCE)
  }

  generateGui(gui: GUI): GUI {
    gui = super.generateGui(gui)

    this.observeGUI(gui.add(this.properties, 'crater_amount', 0, 64, 1)               )
    this.observeGUI(gui.add(this.properties, 'seed', 0, 9999, 1)                      )
    this.observeGUI(gui.add(this.properties, 'crater_min', 0, craterTypes.length-1, 1))
    this.observeGUI(gui.add(this.properties, 'crater_max', 0, craterTypes.length-1, 1))
    this.observeGUI(gui.add(this.properties, 'size_distribution', 0, 1, 0.01)         )

    // this.observeGUI(gui.add(craterTypes[0], 'crater_width' , 0.01,    1,  0.01), this.updateCraters.bind(this))
    // this.observeGUI(gui.add(craterTypes[0], 'crater_height', -0.5,    1, 0.001), this.updateCraters.bind(this))
    // this.observeGUI(gui.add(craterTypes[0], 'rim_steepness',    0,  0.5, 0.001), this.updateCraters.bind(this))
    // this.observeGUI(gui.add(craterTypes[0], 'rim_offset'   ,    0,    1,  0.01), this.updateCraters.bind(this))
    // this.observeGUI(gui.add(craterTypes[0], 'crater_floor' ,   -1,    0.2, 0.001), this.updateCraters.bind(this))
    // this.observeGUI(gui.add(craterTypes[0], 'smoothness'   ,    0,    1, 0.001), this.updateCraters.bind(this))

    return gui
  }

  protected static randomSpherePoint(r: number): Vector3 {
      var u = Math.random();
      var v = Math.random();
      var theta = u * 2.0 * Math.PI;
      var phi = Math.acos(2.0 * v - 1.0);
      // var r = Math.cbrt(Math.random());
      var sinTheta = Math.sin(theta);
      var cosTheta = Math.cos(theta);
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);
      var x = r * sinPhi * cosTheta;
      var y = r * sinPhi * sinTheta;
      var z = r * cosPhi;
      return new Vector3(x, y, z);
  }

  protected generateCraters() {
    for (let i = 0; i < this.properties.crater_amount; i++) {
      // let pos = new Vector3(Math.random() * 2-1, Math.random() * 2-1, Math.random() * 2-1).normalize()
      let pos = CraterNoise.randomSpherePoint(this.controller.getRadius())
      pos.toArray(this.crater_positions, i * 3)

      let n = Math.floor(CraterNoise.biasFunction(Math.random(), this.properties.size_distribution) * craterTypes.length)

      n = Math.max(n, this.properties.crater_min)
      n = Math.min(n, this.properties.crater_max)

      this.crater_sizes[i*3+0] = CraterNoise.bellFunction(craterTypes[n].crater_floor , craterTypes[n].variation)
      this.crater_sizes[i*3+1] = CraterNoise.bellFunction(craterTypes[n].crater_height, craterTypes[n].variation)
      this.crater_sizes[i*3+2] = CraterNoise.bellFunction(craterTypes[n].crater_width , craterTypes[n].variation)

      this.crater_rims[i*3+0] = CraterNoise.bellFunction(craterTypes[n].rim_offset   , craterTypes[n].variation)
      this.crater_rims[i*3+1] = CraterNoise.bellFunction(craterTypes[n].rim_steepness, craterTypes[n].variation)
      this.crater_rims[i*3+2] = CraterNoise.bellFunction(craterTypes[n].smoothness   , craterTypes[n].variation)
    }
  }

  applyNoise(elevation_data: Float32Array, position_data: Float32Array, mask_data?: Float32Array): Float32Array {
    this.generateCraters()
    return super.applyNoise(elevation_data, position_data, mask_data)
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
  crater_width  : 0.05,
  crater_height : 0.13,
  crater_floor  : -0.03,
  rim_steepness : 0.508,
  rim_offset    : 0.54,
  smoothness    : 0.178,
},
{
  variation: 0.1,
  crater_width  : 0.11,
  crater_height : 0.13,
  crater_floor  : -0.05,
  rim_steepness : 0.364,
  rim_offset    : 0.52,
  smoothness    : 0.112,
},
{
  variation: 0.1,
  crater_width  : 0.2,
  crater_height : 0.08,
  rim_steepness : 0.259,
  rim_offset    : 0.47,
  crater_floor  : -0.02,
  smoothness    : 0.035,
},
{
  variation: 0.1,
  crater_width  : 0.25,
  crater_height : 0.13,
  rim_steepness : 0.303,
  rim_offset    : 0.58,
  crater_floor  : -0.02,
  smoothness    : 0,
},
{
  variation: 0.1,
  crater_width  : 0.38,
  crater_height : 0.476,
  rim_steepness : 0.5,
  rim_offset    : 0.46,
  crater_floor  : -0.07,
  smoothness    : 0.112,
},
]

const FRAGMENT_SOURCE = /*glsl*/`
precision highp float;
const int MAX_CRATERS = 64;

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
    if(i >= crater_amount) break;

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

    float x = length(position - center) / crater_width; 

    float cavity = (x * x - 1.0) * crater_height;
    float rimX = min(x - 1.0 - rim_offset, 0.0);
    float rim = rim_steepness * rimX * rimX;

    float crater_shape = smoothMax(cavity, crater_floor, smoothness / 2.0); 
    crater_shape = smoothMin(crater_shape, rim, smoothness);

    total_elevation += crater_shape;

    if(total_elevation > rim) {
      total_elevation -= crater_shape + crater_shape / 10.0;
    }
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