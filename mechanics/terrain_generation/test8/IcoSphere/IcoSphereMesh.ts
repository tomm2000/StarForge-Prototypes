import { Mesh, Vector3, ShaderMaterial, Scene, FloatArray, StandardMaterial, RawTexture3D, MeshBuilder, RawTexture } from "babylonjs"
import { getDefaultPositionShader, positionShader } from "./positionShader"
import { GPGPU } from '../lib/GPGPU'
import { Vector2 } from "babylonjs/Maths/math"
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
    const mesh = MeshBuilder.CreateSphere('icosphere', { updatable: true, diameter: 2}, this.scene)
    // const mesh = MeshBuilder.CreatePlane('plane', {size: 3})
    
    let size = 256
    let data = new Uint8Array(size*size*3)
    const noise = makeNoise3D(Math.random()*999)

    for(let y = 0; y < size; y++) {
      for(let x = 0; x < size; x++) {
        const pos = y*size+x

        const coord = this.cartesianToCoordinate(x/size, y/size)
        const position = this.coordinateToPoint(coord)

        const v = (noise(position.x * 2, position.y * 2, position.z * 2) + 1) / 2

        data[pos*3+0] = v * 256
        data[pos*3+1] = v * 256
        data[pos*3+2] = v * 256
      }
    }

    // console.log(data)

    // data = data.map((el, index) => {
    //   let x = index % 128
    //   let y = Math.floor(index / 128)
      
    // })

    // console.log(data)

    const texture = RawTexture.CreateRGBTexture(data, size, size, this.scene)

    const material = new StandardMaterial('material')

    material.diffuseTexture = texture
    
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