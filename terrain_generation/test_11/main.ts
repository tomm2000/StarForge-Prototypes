import { Scene, Engine, Vector3,  HemisphericLight, MeshBuilder, StandardMaterial,  ArcRotateCamera, Color4, } from "babylonjs";
import { PlanetData } from "./editor/PlanetGenerator/PlanetData";
import { Planet } from "./editor/PlanetGenerator/Planet"
import { PlanetDataJson } from "./common/PlanetData/PlanetDataJson";

let canvas: HTMLCanvasElement = null
let wrap: HTMLDivElement = null
let fps: HTMLDivElement = null
let engine: Engine = null
let scene: Scene = null
let camera: ArcRotateCamera = null
let item: Planet = null

function dispose() {
  item.dispose()
  scene.dispose()
  camera.dispose()
  engine.dispose()
}

export const mod = {
  init,
  dispose,
  onUpload,
  onEmpty
}

type inputs = {
  id: string,
  canvas_element: HTMLCanvasElement,
  wrap_element: HTMLDivElement,
  fps_element: HTMLDivElement,
}

function onUpload(payload: Event) {
  let fr = new FileReader()

  fr.readAsText((payload.target as any).files[0])

  fr.onload = () => {
    if(typeof fr.result != 'string') { return }

    let data = JSON.parse(fr.result) as PlanetDataJson

    if(item) { item.dispose() }

    item = new Planet(scene, new PlanetData(data))
  }
}

function onEmpty() {
  if(item) { item.dispose() }
  
  item = new Planet(scene)
}

function init({id, canvas_element, wrap_element, fps_element}: inputs) {
  canvas = canvas_element
  wrap = wrap_element
  fps = fps_element

  addScene()
  addCamera()
  addLights()
  addGridHelper()
  addResizeListener()

  addItem()

  initUpdate()

  return DESCRIPTION
}

const DESCRIPTION = `
`

function addItem() {
  item = new Planet(scene)
}

function addScene() {
  engine = new Engine(canvas)
  scene = new Scene(engine)
  scene.clearColor = new Color4(15/255, 15/255, 15/255)
}


function addCamera() {
  camera = new ArcRotateCamera(
    "Camera",
    Math.PI / 4,
    Math.PI / 4,
    4,
    Vector3.Zero(),
    scene
  );
  
  // Target the camera to scene origin
  camera.setTarget(Vector3.Zero());
  // Attach the camera to the canvas
  camera.attachControl(canvas, false);
}

function addLights() {
  new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
}

function addGridHelper() {
  var ground = MeshBuilder.CreateGround(
    "ground1",
    { width: 12, height: 12, subdivisions: 6, updatable: false },
    scene
  );
  const material = new StandardMaterial("texture", scene)
  material.wireframe = true
  ground.material = material
  ground.position.y = -2;
}

function addResizeListener() {
  window.addEventListener("resize", () => {
    engine.resize();
  });
  engine.resize();
}

function update() {
  scene.render();

  if(fps) {
    fps.innerHTML = `FPS: ${engine.getFps().toFixed()}`
  }
}

function initUpdate() {
  engine.runRenderLoop(update);
}