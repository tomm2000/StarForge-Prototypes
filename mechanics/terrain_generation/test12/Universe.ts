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
  Color3,
  Color4,
} from "babylonjs";
import { listAll, ref } from "firebase/storage";
import { IcoSphereMesh } from "./IcoSphere/IcoSphereMesh";
import { BasicNoise } from "./ObjectData/Noise/BasicNoise";
import { TestPlanet } from "./PlanetGenerators/TestPlanet";
import { getFirebaseApp } from '../../firebase/init'
// import { Terrestrial1 } from "./PlanetPrefabs/Terrestial1";

export class Universe {
  private scene: Scene;
  private engine: Engine;
  private planets: TestPlanet[] = [];
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
      this.planets.push(new TestPlanet(this.scene, undefined))
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
      Math.PI / 4,
      4,
      Vector3.Zero(),
      scene
    );

    camera.wheelDeltaPercentage = 0.01
    camera.minZ = 0

    // Target the camera to scene origin
    camera.setTarget(Vector3.Zero());
    
    // Attach the camera to the canvas
    camera.attachControl(canvas, false);

    // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

    // Create a built-in "ground" shape;
    var ground = MeshBuilder.CreateGround(
      "ground1",
      { width: 12, height: 12, subdivisions: 6, updatable: false },
      scene
    );
    const material = new StandardMaterial("texture", scene)
    material.wireframe = true
    ground.material = material
    ground.position.y = -2;


    scene.clearColor = new Color4(15/255, 15/255, 15/255)

    // Return the created scene
    return scene;
  }

  public dispose() {
    this.planets.forEach(planet => planet.dispose())
  }
}
