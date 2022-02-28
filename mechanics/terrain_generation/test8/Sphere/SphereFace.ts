import {  Mesh, NoiseProceduralTexture, Scene, ShaderMaterial, Texture, Vector2, Vector3, VertexData } from "babylonjs";
import { divideScalar, multiplyScalar } from "../lib/VectorMath";
import { SphereMesh } from "./SphereMesh";

export class SphereFace {
  private normal: Vector3
  private parent: SphereMesh
  // private geometry: BufferGeometry = new BufferGeometry()
  private mesh: Mesh
  private scene: Scene
  private texture: Texture

  constructor(scene: Scene, normal: Vector3, parent: SphereMesh, texture: Texture) {
    this.normal = normal
    this.parent = parent
    this.mesh = new Mesh('mesh', scene)
    this.scene = scene
    this.texture = texture
  }

  generateGeometry(): void {
    const { parent, normal } = this
    const resolution = parent.getResolution()

    const positionNumComponents = 3;
    // const normalNumComponents = 3;
    // const uvNumComponents = 2;

    const numVertices = resolution * resolution
    const numIndices = (resolution-1) * (resolution-1) * 6;

    const positions: number[] = []
    // const normalArray: number[] = []
    // const uvArray: number[] = []
    const indices : number[] = []

    let triIndex = 0

    const axisA = new Vector3(normal.y, normal.z, normal.x)
    const axisB = normal.clone().cross(axisA)

    for(let y = 0; y < resolution; y ++) {
      for(let x = 0; x < resolution; x ++) {
        const i = x + y * resolution

        const percent = divideScalar(new Vector2(x,y), resolution-1)

        const a  = multiplyScalar(axisA, (percent.x - .5) * 2)
        const b  = multiplyScalar(axisB, (percent.y - .5) * 2)

        const pointOnUnitCube: Vector3 = normal.clone().add(a).add(b)
        
        // let {x, y, z} = pointOnUnitCube

        const x2 = pointOnUnitCube.x*pointOnUnitCube.x
        const y2 = pointOnUnitCube.y*pointOnUnitCube.y
        const z2 = pointOnUnitCube.z*pointOnUnitCube.z

        const px = pointOnUnitCube.x * Math.sqrt(1 - (y2+z2) / 2 + (y2 * z2) / 3)
        const py = pointOnUnitCube.y * Math.sqrt(1 - (z2+x2) / 2 + (z2 * x2) / 3)
        const pz = pointOnUnitCube.z * Math.sqrt(1 - (x2+y2) / 2 + (x2 * y2) / 3)


        // x = x * Math.sqrt(1 - (y*y/2) - (z*z/2) + (y*y*z*z/3))
        // y = y * Math.sqrt(1 - (z*z/2) - (x*x/2) + (z*z*x*x/3))
        // z = z * Math.sqrt(1 - (x*x/2) - (y*y/2) + (x*x*y*y/3))

        const pointOnUnitSphere = new Vector3(px,py,pz)
        // const pointOnUnitSphere = pointOnUnitCube.clone().normalize()

        positions.push(...pointOnUnitSphere.asArray())

        if(x != resolution-1 && y != resolution-1) {
          indices[triIndex+2] = i;
          indices[triIndex+1] = i + resolution + 1;
          indices[triIndex+0] = i + resolution;

          indices[triIndex+5] = i;
          indices[triIndex+4] = i + 1;
          indices[triIndex+3] = i + resolution + 1;

          triIndex += 6;
        }
      }
    }

    const vertexData = new VertexData()

    vertexData.positions = positions
    vertexData.indices = indices

    vertexData.applyToMesh(this.mesh)

    // console.log(this.mesh.geometry?.getVerticesData('position'))

    const vertexSource = `
    precision highp float;
    attribute vec3 position;
    attribute vec2 uv;
    uniform mat4 worldViewProjection;
    varying vec2 vUV;

    const float math_pi = 3.141592653589793;

    void main(void) {
      gl_Position = worldViewProjection * vec4(position, 1.0);

      vec3 pos = normalize(position);

      float latitude = asin(pos.y) + math_pi/2.0;
      float longitude = atan(pos.x, -pos.z) + math_pi;

      vUV = vec2(longitude / (math_pi * 2.0), latitude / math_pi);
    }
    `

    const fragmentSource = `
    precision highp float;
    varying vec2 vUV;
    uniform sampler2D textureSampler;
    uniform sampler2D heighmap;

    const float math_pi = 3.141592653589793;

    void main(void) {

      vec3 color = texture2D(heighmap, vUV).xyz;

      color = max(vec3(0.0, 0.0, 0.), color - 0.3);
      
      gl_FragColor = vec4(color, 1.0);

      // gl_FragColor = vec4(vUV.y, vUV.y, vUV.y, 1.0);
    }
    `

    var material = new ShaderMaterial(
      "shader",
      this.scene,
      { vertexSource, fragmentSource },
      {
        attributes: ["position", "normal", "uv"],
        uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
        samplers: ['heighmap']
      },
    );

    
    material.setTexture('heighmap', this.texture)
    

    this.mesh.material = material
  }

  getMesh(): Mesh {

    return this.mesh
  } 

  dispose() {
  }
}