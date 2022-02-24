import { Vector2, Vector3 } from "three";
import { Canvas } from "../shared/Canvas";
import { Planet } from "./Planet";
import * as dat from 'dat.gui'

export class World extends Canvas {
  plane: Planet

  constructor(canvas_id: string, container_id: string) {
    super(canvas_id, container_id);

    this.plane = new Planet(new Vector2(500, 500), new Vector2(16, 16))

    this.init()
  }

  private init() {
    this.addObject(this.plane)

    // const gui = new dat.GUI()
    // const cubeFolder = gui.addFolder('Cube')
    // cubeFolder.add(cube.rotation, 'x', 0, Math.PI * 2)
    // cubeFolder.add(cube.rotation, 'y', 0, Math.PI * 2)
    // cubeFolder.add(cube.rotation, 'z', 0, Math.PI * 2)
    // cubeFolder.open()
    // const cameraFolder = gui.addFolder('Camera')
    // cameraFolder.add(camera.position, 'z', 0, 10)
    // cameraFolder.open()

  }
}