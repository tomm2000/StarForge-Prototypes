import { Object3D, Event, FrontSide, PlaneGeometry, MeshStandardMaterial, Mesh, Vector3, Vector2, Color, TorusGeometry, SphereGeometry, MeshNormalMaterial } from 'three'
import { DrawObject } from '../shared/DrawObject'
import { Pos1Dto2d, position2Dnormalized, sumVectors } from '../shared/helpers';
import { makeNoise3D } from 'open-simplex-noise'
import { lerp } from 'three/src/math/MathUtils';
import { sigmoid } from '~/mechanics/common/functions';

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

    const detail = 20

    const object = new Mesh(
      // new SphereGeometry(200, 16, 12),
      new SphereGeometry(200, 8*detail, 6*detail),

      // new MeshStandardMaterial({
      //     wireframe: true,
      //     // color: 0x37a01c,
      //     // side: FrontSide,
      // })

      new MeshNormalMaterial()
    );

    

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
        // const delta = Math.sin(vector.y/25)*20
        const noide3D = makeNoise3D(Math.random())

        // vector.multiplyScalar(0.1)

        let pos = vector.clone().multiplyScalar(0.015)

        let delta = noide3D(pos.x, pos.y, pos.z)

        if(delta > 0) {
          pos = vector.clone().multiplyScalar(0.06)
          delta += (noide3D(pos.x, pos.y, pos.z)+0.5)/4 * delta
        } else {
          delta =  0//delta*2
        }

        let change = vector.clone().normalize().multiplyScalar(delta*15)
        // position.setZ(i, Math.sqrt(Math.pow(x*20, 2) + Math.pow(y*20, 2) + 25))

        let new_position = change.add(vector)

        let {x, y, z} = new_position

        position.setXYZ(i, x, y, z)

        
      }

      // console.log(position.count)
    }

    object.geometry.computeVertexNormals()
    
    return object
  }
}