import { ArcRotateCamera, Engine, HemisphericLight, StandardMaterial, Vector3, MeshBuilder, Scene } from "babylonjs"
import { Planet } from './PlanetPrefabs/Planet'

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
  dispose
}

type inputs = {
  id: string,
  canvas_element: HTMLCanvasElement,
  wrap_element: HTMLDivElement,
  fps_element: HTMLDivElement,
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
  item = new Planet(scene, 1)
}

function addScene() {
  engine = new Engine(canvas)
  scene = new Scene(engine)
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
  // Create a built-in "ground" shape;
  let ground = MeshBuilder.CreateGround(
    "ground1",
    { width: 6, height: 6, subdivisions: 2, updatable: false },
    scene
  );
  ground.material = new StandardMaterial("texture", scene);
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