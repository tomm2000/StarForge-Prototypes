import { makeNoise3D } from "open-simplex-noise";
import { Material, Mesh, BoxGeometry, Scene, MeshStandardMaterial, Vector3, Texture, Vector2 } from "three";
import { mapValue } from "../../test7/lib/Math";
import { matrixToArrayPos } from "../lib/Misc";
import { v2String, v3String } from "../lib/VectorMath";
import { cubeToCartesian, cubeToUv } from "./CubeTexture";
import { pointToUv, uvToPoint } from '../Sphere/WarpTexture';

export class CubeSphere {
  private mesh: Mesh = new Mesh()
  private material: Material
  private geometry: BoxGeometry

  private resolution: number

  constructor(resolution: number = 32, material: Material = new MeshStandardMaterial(), heightMap: Uint8Array, heightMapSize: Vector2) {
    this.resolution = resolution
    this.material = material
    this.geometry = this.generateGeometry(heightMap, heightMapSize)

    this.mesh.material = this.material
    this.mesh.geometry = this.geometry
  }

  generateGeometry(heightMap: Uint8Array, heightMapSize: Vector2): BoxGeometry {
    const geometry = new BoxGeometry(2, 2, 2, this.resolution, this.resolution, this.resolution)

    const positions = geometry.getAttribute('position')
    const uvs       = geometry.getAttribute('uv')
    const normals   = geometry.getAttribute('normal')
    
    const noise = makeNoise3D(999)

    for(let i = 0; i < positions.count; i++) {
      const cube = new Vector3(positions.getX(i), positions.getY(i), positions.getZ(i))
      const normal = new Vector3(normals.getX(i), normals.getY(i), normals.getZ(i))

      const x2 = cube.x * cube.x
      const y2 = cube.y * cube.y
      const z2 = cube.z * cube.z

      const px = cube.x * Math.sqrt(1 - (y2+z2) / 2 + (y2 * z2) / 3)
      const py = cube.y * Math.sqrt(1 - (z2+x2) / 2 + (z2 * x2) / 3)
      const pz = cube.z * Math.sqrt(1 - (x2+y2) / 2 + (x2 * y2) / 3)


      const uvPos = cubeToUv(cube.clone(), normal.clone())
      uvs.setXY(i, uvPos.x, uvPos.y)


      // const cartpos = cubeToCartesian(cube.clone(), normal.clone(), heightMapSize)

      // const position = matrixToArrayPos(cartpos, heightMapSize)

      // const elevation = 1 + heightMap[Math.round(position*4+0)] / 255

      const elevation = 1 + (noise(px * 2, py * 2, pz * 2) + 1) / 2


      // const p = cube.clone().normalize()
      // positions.setXYZ(i, p.x * elevation.x, p.y * elevation.y, p.z * elevation.z)

      positions.setXYZ(i, px * elevation, py * elevation, pz * elevation)

    }

    // console.log(uv)

    geometry.computeVertexNormals()

    return geometry
  }

  addToScene(scene: Scene) {
    scene.add(this.mesh)
  }
}