import { IcosahedronBufferGeometry, Vector2, Vector3 } from "three";
import { Canvas } from "../shared/Canvas";
import * as dat from 'dat.gui'
import { SphereMesh } from "./Sphere/SphereMesh";
import { IcoSphereMesh } from "./IcoSphere/IcoSphereMesh";
import { Terrestrial1 } from "./PlanetPrefabs/Terrestial1";

export class Universe extends Canvas {
  planet = new Terrestrial1()

  constructor(canvas_id: string, container_id: string) {
    super(canvas_id, container_id);

    this.init()
  }

  private init() {
    this.scene.add(this.planet.getMesh())
  }

  regenerateMeshes() {
    // let rng = Math.ceil(Math.random()*256)
    // console.log(rng)
    // this.sphere.setResolution(rng)
  }

  disposte() {
    this.planet.dispose()
  }
}