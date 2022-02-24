import { Vector2, Vector3 } from "three";
import { Canvas } from "../shared/Canvas";
import { FlatPlane } from "./FlatPlane";

export class FlatWorld extends Canvas {
  plane: FlatPlane

  constructor(canvas_id: string, container_id: string) {
    super(canvas_id, container_id);

    this.plane = new FlatPlane(new Vector2(500, 500), new Vector2(16, 16))

    this.init()
  }

  private init() {
    this.addObject(this.plane)
  }
}