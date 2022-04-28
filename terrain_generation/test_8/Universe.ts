import {
  Scene,
  Engine,
  FreeCamera,
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Mesh,
  UniversalCamera,
  StandardMaterial,
  ArcRotateCamera,
  PointLight,
  AxesViewer
} from "babylonjs";
import { SphereMesh } from "./Sphere/SphereMesh";
import { Planet } from "./Plan./PlanetPrefabs/Planet
import { PlanetPrefab } from "./PlanetPrefabs/PlanetPrefab";

export class Universe {
  private scene: Scene;
  private engine: Engine;
  private planets: PlanetPrefab[] = [];
  private divFps: HTMLElement | null 

  constructor(canvas: HTMLCanvasElement) {
    // this.engine = new Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
    this.engine = new Engine(canvas);
    this.scene = this.getNewScene(this.engine, canvas);
    this.divFps = document.getElementById('divFps')

    // run the render loop
    this.engine.runRenderLoop(() => {
      this.scene.render();

      if(this.divFps) {
        this.divFps.innerHTML = this.engine.getFps().toFixed() + " fps";
      }
    });
    // the canvas/window resize event handler
    window.addEventListener("resize", () => {
      this.engine.resize();
    });

    const n = 1
    for(let i = 0; i < n; i++) {
      this.planets.push(new Planet(this.scene))
    }
  }

  private getNewScene(engine: Engine, canvas: HTMLCanvasElement): Scene {
    // Create a basic BJS Scene object
    var scene = new Scene(engine);
    // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
    // var camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene);
    var camera = new ArcRotateCamera(
      "Camera",
      Math.PI / 4,
      Math.PI / 3,
      2,
      Vector3.Zero(),
      scene
    );
    // Target the camera to scene origin
    camera.setTarget(Vector3.Zero());
    // Attach the camera to the canvas
    camera.attachControl(canvas, false);
    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    // var light = new HemisphericLight("light1", new Vector3(0, 1, -4), scene);
    new PointLight('light', new Vector3(0, 6, -4), scene)
    new HemisphericLight("light1", new Vector3(0, -1, 0), scene);
    // new AxesViewer(scene, 2)
    // Create a built-in "ground" shape;
    var ground = MeshBuilder.CreateGround(
      "ground1",
      { width: 6, height: 6, subdivisions: 2, updatable: false },
      scene
    );
    ground.material = new StandardMaterial("texture", scene);
    ground.position.y = -2;
    // Return the created scene
    return scene;
  }

  public dispose() {
    this.planets.forEach(planet => planet.dispose())
    this.scene.dispose()
    this.engine.dispose()
  }
}
