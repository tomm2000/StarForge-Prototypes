import { FrontSide } from 'three/src/constants'
import { Mesh } from 'three/src/objects/Mesh'
import { PlaneGeometry } from 'three/src/geometries/PlaneGeometry'
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial'
import { Vector2 } from 'three/src/math/Vector2'
import { Pos1Dto2d, position2Dnormalized, sumVectors } from './lib'
import { Vector3 } from 'three/src/math/Vector3'

export class FlatPlane {
  mesh: Mesh
  size: Vector2
  resolution: Vector2

  constructor(size: Vector2, resolution: Vector2) {
    this.size = size
    this.resolution = resolution
  }

  update(): void { }

  generate(): Mesh {
    const plane = new Mesh(
      new PlaneGeometry(this.size.x, this.size.y, this.resolution.x, this.resolution.y),
      new MeshStandardMaterial({
          wireframe: true,
          color: 0xFFFFFF,
          side: FrontSide,
    }));

    plane.castShadow = false;
    plane.receiveShadow = true;
    
    this.mesh = plane

    // let geo = plane.geometry

    if (plane.isMesh) {
      const position = plane.geometry.attributes.position;
      const vector = new Vector3();
   
      for ( let i = 0, l = position.count; i < l; i ++ ) {
        let position2D = Pos1Dto2d(i, sumVectors(this.resolution, new Vector2(1, 1)))

        position2D = position2Dnormalized(position2D, sumVectors(this.resolution, new Vector2(1, 1)))
        // console.log(position2D)

        vector.fromBufferAttribute( position, i );
        vector.applyMatrix4( plane.matrixWorld );

        // console.log(position2D)

        let {x, y} = position2D

        position.setZ(i, Math.pow(x/3, 3) + Math.pow(y, 2))
      }

      // console.log(position.count)
    }

    return plane
  }

  dispose(): void {
    this.mesh.geometry.dispose()
  }
}