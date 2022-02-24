import * as THREE from 'three'

export interface DrawObject {
  mesh3D: THREE.Object3D

  /** updates the element */
  update: () => void
  /** should return the cached mesh */
  get3D: () => THREE.Object3D
  /** should save the newly generated mesh in the class parameter and return it */
  generate3D: () => THREE.Object3D
}