import { Scene, Engine, Vector3, HemisphericLight, MeshBuilder, StandardMaterial, ArcRotateCamera, Color4, Color3, PointLight, Observer, } from "babylonjs";
import { initFirebaseApp } from "./database/init";
import { Planet } from "./Planet/generators/Planet";


type inputs = {
  id: string,
  canvas_element: HTMLCanvasElement,
  wrap_element: HTMLDivElement,
  fps_element: HTMLDivElement,
}

export function DisplayControllerFactory(inputs: inputs): DisplayController {
  return new DisplayController(inputs);
}

class DisplayController {
  private canvas: HTMLCanvasElement = null
  private wrap: HTMLDivElement = null
  private fps: HTMLDivElement = null
  private engine: Engine = null
  private scene: Scene = null
  private camera: ArcRotateCamera = null
  private item: Planet = null

  constructor({canvas_element, fps_element, id, wrap_element}: inputs) {
    this.canvas = canvas_element
    this.wrap = wrap_element
    this.fps = fps_element
  
    this.initFirebase()
  
    this.addScene()

    this.addCamera()
    this.addLights()
    // addGridHelper()
    this.addResizeListener()
  
    this.addItem()
  
    this.initUpdate();

    // fix for the canvas size being 0 at the start, for some reason i can't figure out
    function resize() {
      if(this.wrap.clientWidth == 0 || this.wrap.clientHeight == 0) {
        console.log(this.wrap.clientWidth, this.wrap.clientHeight)
  
        setTimeout(resize.bind(this), 5);      
      } else {
        this.engine.setSize(this.wrap.clientWidth, this.wrap.clientHeight)
      }
    }

    resize.bind(this)()

  }

  dispose() {
    this.item.dispose()
    // this.scene.dispose()
    // this.camera.dispose()
    this.engine.dispose()

    delete this.item
    delete this.engine
    delete this.scene
    delete this.camera
  }

  onUpload(payload: Event) {
    let fr = new FileReader()
  
    fr.readAsText((payload.target as any).files[0])
  
    fr.onload = () => {
      if(typeof fr.result != 'string') { return }
  
      let data: object = JSON.parse(fr.result)
  
      if(this.item) { this.item.dispose() }
  
      Planet.fromJson(this.scene, data)
        .then((planet) => {
          this.item = planet
        })
    }
  }

  getDescription() {
    return ''
  }

  private initFirebase() {
    initFirebaseApp()
  }

  private addItem() {
    Planet.fromFirebase(this.scene, 'terr_2.json').then(planet => this.item = planet)
  }

  private addScene() {
    this.engine = new Engine(this.canvas)
    this.scene = new Scene(this.engine)
    this.scene.clearColor = new Color4(15/255, 15/255, 15/255)
  }
  
  private addCamera() {
    this.camera = new ArcRotateCamera(
      "Camera",
      Math.PI / 4,
      Math.PI / 4,
      16,
      Vector3.Zero(),
      this.scene
    );
  
    this.camera.wheelDeltaPercentage = 0.01
    this.camera.minZ = 0
    
    // Target the camera to scene origin
    this.camera.setTarget(Vector3.Zero());
    // Attach the camera to the canvas
    this.camera.attachControl(this.canvas, false);
  }

  private addLights() {
    new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
  }

  private addGridHelper() {
    var ground = MeshBuilder.CreateGround(
      "ground1",
      { width: 12, height: 12, subdivisions: 6, updatable: false },
      this.scene
    );
    const material = new StandardMaterial("texture", this.scene)
    material.wireframe = true
    ground.material = material
    ground.position.y = -2;
  }

  private addResizeListener() {
    console.log('here')
  
    window.addEventListener("resize", () => {
      this.engine.resize();
    })
  }

  private update() {
    this.scene.render();
  
    if(this.fps) {
      this.fps.innerHTML = `FPS: ${this.engine.getFps().toFixed()}`
    }
  }

  private initUpdate() {
    this.engine.runRenderLoop(this.update.bind(this));
  }
}