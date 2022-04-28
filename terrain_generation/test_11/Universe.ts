import { Scene, Engine, Vector3,  HemisphericLight, MeshBuilder, StandardMaterial,  ArcRotateCamera, Color4, } from "babylonjs";
import { PlanetData } from "./editor/PlanetGenerator/PlanetData";
import { BasePlanet } from "./editor/PlanetGenerator/BasePlanet";
import { Planet } from "./editor/PlanetGenerator/Planet"
import { PlanetDataJson } from "./common/PlanetData/PlanetDataJson";

export class Universe {
  private scene: Scene;
  private engine: Engine;
  private planets: BasePlanet[] = [];
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

  addPlanetFromData(planetData: PlanetDataJson) {
    if(this.planets[0]) { this.planets[0]?.dispose() }
    
    this.planets[0] = new Planet(this.scene, new PlanetData(planetData))
  }

  addPlanet() {
    if(this.planets[0]) { this.planets[0]?.dispose() }
    
    this.planets[0] = new Planet(this.scene)
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

    this.scene.dispose()
    this.engine.dispose()
  }
}
