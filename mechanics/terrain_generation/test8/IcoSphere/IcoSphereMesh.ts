import { Vector2, Mesh, Vector3, ShaderMaterial, Scene, FloatArray, StandardMaterial, RawTexture3D, MeshBuilder, RawTexture, Effect } from "babylonjs"
import { getDefaultPositionShader, positionShader } from "./positionShader"
import { GPGPU } from '../lib/GPGPU'
import { makeNoise3D } from "open-simplex-noise"

const defaultPositionShader = getDefaultPositionShader()
const GpuDataSize = 4

type Coordinate = {
  latitude: number,
  longitude: number
}

export class IcoSphereMesh {
  private resolution: number = 10
  private positionShader: positionShader
  private mesh: Mesh
  private material: ShaderMaterial | undefined
  private scene: Scene
  private GPGPU: GPGPU | undefined
  private meshImageRoot: number | undefined
  private originalMeshData: Float32Array | undefined

  constructor(scene: Scene, resolution: number = 10, positionShader: positionShader = defaultPositionShader) {
    this.positionShader = positionShader;
    this.resolution = resolution
    this.scene = scene
    this.mesh = this.generateNewMesh()
  }

  getResolution(): number { return this.resolution }
  /** sets the new resolution, DOES regenerate the mesh! */
  setResolution(resolution: number): void {
    this.resolution = resolution
    this.generateNewMesh()
  }

  getMaterial(): ShaderMaterial | undefined { return this.material }
  // /** sets the new material, does NOT regenerate the mesh! */
  setMaterial(material: ShaderMaterial): void {
    this.material = material
    this.mesh.material = this.material
  }

  getPositionShader(): positionShader | undefined { return this.positionShader }
  // /** sets the new material, does NOT regenerate the mesh! */
  setPositionShader(positionShader: positionShader): void {
    this.positionShader = positionShader
  }

  /** updates the position of the points on the object, does NOT generate a new geometry (resolution changes have no effect!) */
  updateMesh(): void {
    
  }

  /* https://stackoverflow.com/q/5674149

    float lat = Math.Acos(position.Y / radius); //theta
    float lon = Math.Atan(position.X / position.Z); //phi

    float xPos = Math.sin(latitude) * Math.cos(longitude);
    float zPos = Math.sin(latitude) * Math.sin(longitude);
    float yPos = Math.cos(latitude);
    
  */

  pointToCoordinate(pointOnUnitSphere: Vector3): Coordinate {
    const latitude = Math.asin(pointOnUnitSphere.y)
    const longitude = Math.atan2(pointOnUnitSphere.x, -pointOnUnitSphere.z)
    return {latitude, longitude}
  }

  cartesianToCoordinate(x: number, y: number): Coordinate {
    const latitude  = y * Math.PI - Math.PI/2
    const longitude = x * 2 * Math.PI - Math.PI
    return {latitude, longitude}
  }

  coordinateToPoint(coordinate: Coordinate): Vector3 {
    const y = Math.sin(coordinate.latitude)
    const r = Math.cos(coordinate.latitude)
    const x = Math.sin(coordinate.longitude) * r
    const z = -Math.cos(coordinate.longitude) * r
    return new Vector3(x,y,z)
  }

  /** generates a new mesh from scratch */
  generateNewMesh(): Mesh {
    const mesh = MeshBuilder.CreateIcoSphere('icosphere', { updatable: true, subdivisions: 128 }, this.scene)
    // const mesh = MeshBuilder.CreatePlane('plane', { width: 2, height: 1 })
    // const mesh = MeshBuilder.CreateSphere('sphere', { diameter: 2})
    
    //---- noise generation ----
    let size = new Vector2(256, 256)
    // let noiseData = new Uint8Array(size*size*3)
    let noiseData = new Float32Array(size.x * size.y * 4)
    let noiseTexture = new Uint8Array(size.x * size.y * 4)
    const noise = makeNoise3D(Math.random()*999)

    for(let y = 0; y < size.y; y++) {
      for(let x = 0; x < size.x; x++) {
        const pos = y*size.y+x

        const coord = this.cartesianToCoordinate(x / size.x, y / size.y)
        const position = this.coordinateToPoint(coord)

        const v = (noise(position.x * 2, position.y * 2, position.z * 2) + 1) / 2

        noiseTexture[pos*4+0] = v * 256
        noiseTexture[pos*4+1] = v * 256
        noiseTexture[pos*4+2] = v * 256
        noiseTexture[pos*4+3] = 255

        noiseData[pos*4+0] = v
        noiseData[pos*4+1] = v
        noiseData[pos*4+2] = v
        noiseData[pos*4+3] = 1
      }
    }

    //---- mesh updating ----
    mesh.updateMeshPositions((data) => {
      const dataLength      = data.length / 3 * 4
      this.originalMeshData = new Float32Array(dataLength)

      for (let i = 0; i < data.length / 3; i++) {
        // normalizing data from [-1,1] -> [0,2] -> [0,1]
        this.originalMeshData[i*4 + 0] = (data[i*3 + 0] + 1) / 2
        this.originalMeshData[i*4 + 1] = (data[i*3 + 1] + 1) / 2
        this.originalMeshData[i*4 + 2] = (data[i*3 + 2] + 1) / 2


        this.originalMeshData[i*4 + 3] = 1
      }

      if(this.meshImageRoot == undefined) {
        let size = Math.floor(Math.sqrt(dataLength / 4))
        while((dataLength / 4) %size != 0) {
          size -= 1
        }
        // console.log(dataLength / 4 / size, size)
        this.meshImageRoot = size
      }

      this.GPGPU = new GPGPU({width: dataLength / 4 / this.meshImageRoot, height: this.meshImageRoot})

      this.GPGPU.makeFrameBuffer(dataLength / 4 / this.meshImageRoot, this.meshImageRoot)

      this.GPGPU.makeTexture(this.originalMeshData)
      this.GPGPU.makeTexture(noiseData, size.x, size.y)

      this.GPGPU.buildProgram(this.positionShader.fragmentSource, this.positionShader.vertexSource)

      this.GPGPU.addAttrib("position", {numElements: 3, stride: 20, offset: 0})
      this.GPGPU.addAttrib("textureCoord", {numElements: 2, stride: 20, offset: 12})

      this.positionShader.uniforms.forEach(uniform => {
        this.GPGPU?.addUniform(uniform.name, uniform.value)
      })

      this.GPGPU.addUniform('math_pi', Math.PI)

      this.GPGPU.draw()

      const results = this.GPGPU.getPixels()

      // console.log(results)

      for(let i = 0; i < results.length / 4; i++) {
        const elevation = results[i*4 + 3]
        // console.log(elevation)
        // console.log(results[i*4 + 0])
        // console.log(results[i*4 + 1])
        // console.log()
        
        // restoring data from [0,1] -> [0,2] -> [-1,1]
        data[i*3 + 0] = (results[i*4 + 0] * 2 - 1) * (1 + 1/ elevation)
        data[i*3 + 1] = (results[i*4 + 1] * 2 - 1) * (1 + 1/ elevation)
        data[i*3 + 2] = (results[i*4 + 2] * 2 - 1) * (1 + 1/ elevation)
      }
    }, true)

    const texture = RawTexture.CreateRGBATexture(noiseTexture, size.x, size.y, this.scene)

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

      color = max(vec3(0.0, 0.0, 0.), color - 0.6);
      
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

    material.setTexture('heighmap', texture)

    // material.diffuseTexture = texture
    
    mesh.material = material

    this.mesh = mesh

    return this.mesh 
  }

  getMesh(): Mesh {
    return this.mesh || this.generateNewMesh()
  }

  dispose() {
    this.GPGPU?.delete()
    this.mesh.dispose()
  }
}