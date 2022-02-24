import { Object3D, Event, FrontSide, PlaneGeometry, MeshStandardMaterial, Mesh, Vector3, Vector2, Color, TorusGeometry, SphereGeometry } from 'three'
import { DrawObject } from '../shared/DrawObject'
import { Pos1Dto2d, position2Dnormalized, sumVectors } from '../shared/helpers';

export class Planet implements DrawObject {
  mesh3D!: Object3D;
  size: Vector2
  resolution: Vector2

  constructor(size: Vector2, resolution: Vector2) {
    this.size = size
    this.resolution = resolution
  }

  update(): void {

  }

  get3D(): Object3D {
    if(!this.mesh3D) {
      return this.generate3D()
    } else {
      return this.mesh3D
    }
  }

  generate3D(): Object3D {
    const object = new Mesh(
      // new SphereGeometry(200, 16, 12),
      new SphereGeometry(200, 30, 30),

      new MeshStandardMaterial({
          wireframe: true,
          // color: 0x37a01c,
          side: FrontSide,
      }));
  
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
}