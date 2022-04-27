import { FrontSide } from 'three/src/constants'
import { Mesh } from 'three/src/objects/Mesh'
import { SphereGeometry } from 'three/src/geometries/SphereGeometry'
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial'
import { Vector2 } from 'three/src/math/Vector2'
import { Pos1Dto2d, position2Dnormalized, sumVectors } from './lib'
import { Vector3 } from 'three/src/math/Vector3'


export class Planet {
  mesh: Mesh
  size: Vector2
  resolution: Vector2

  constructor(size: Vector2, resolution: Vector2) {
    this.size = size
    this.resolution = resolution
  }

  update(): void { }

  generate(): Mesh {
    const object = new Mesh(
      // new SphereGeometry(200, 16, 12),
      new SphereGeometry(200, 30, 30),

      new MeshStandardMaterial({
          wireframe: true,
          // color: 0x37a01c,
          side: FrontSide,
    }));

    this.mesh = object
  
    if ( object.isMesh ) {
      const position = object.geometry.attributes.position;
      const vector = new Vector3();
   
      for ( let i = 0, l = position.count; i < l; i ++ ) {
        let position2D = Pos1Dto2d(i, sumVectors(this.resolution, new Vector2(1, 1)))

        position2D = position2Dnormalized(position2D, sumVectors(this.resolution, new Vector2(1, 1)))
        // console.log(position2D)

        vector.fromBufferAttribute( position, i );
        vector.applyMatrix4( object.matrixWorld );

        // console.log(position2D)

        // const delta = Math.random() * 20
        const delta = Math.sin(vector.y/25)*20

        let change = vector.clone().normalize().multiplyScalar(delta)


        // position.setZ(i, Math.sqrt(Math.pow(x*20, 2) + Math.pow(y*20, 2) + 25))

        let new_position = change.add(vector)

        let {x, y, z} = new_position

        position.setXYZ(i, x, y, z)

        
      }

      // console.log(position.count)
    }
    
    return object
  }

  dispose(): void {
    this.mesh.geometry.dispose()
  }
}