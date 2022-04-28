import { DirectionalLight, PerspectiveCamera, Scene } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Vector2 } from 'three/src/math/Vector2'
import { WebGLRenderer } from 'three/src/renderers/WebGLRenderer'
import { Planet } from "./PlanetPrefabs/Planet"

let canvas: HTMLCanvasElement = null
let wrap: HTMLDivElement = null
let scene: Scene = null
let camera: PerspectiveCamera = null
let controls: OrbitControls = null
let renderer: WebGLRenderer = null
let item: Planet = null
let updater: NodeJS.Timer = null
const sizes = { width: 0, height: 0 }

function dispose() {
  renderer.dispose()
  controls.dispose()
  scene = null
  item?.dispose()
  item = null
  clearInterval(updater)
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

function init({id, canvas_element, wrap_element}: inputs) {
  canvas = canvas_element
  wrap = wrap_element

  addItem()
  addScene()
  addLights()
  addGridHelper()
  addCamera()
  addControls()
  addRenderer()
  addResizeListener()

  // item.generate()
  scene.add(item.getMesh())
  
  initUpdate()

  return DESCRIPTION
}

const DESCRIPTION = `
`

function addItem() {
  item = new Planet()
}

function addScene() {
  scene = new Scene()
}

function addLights() {
  let light = new DirectionalLight(0xffffff, 0.5);
  light.position.set(-400, 400, -400);
  light.target.position.set(0, 0, 0);
  light.castShadow = false;
  scene.add(light);


  light = new DirectionalLight(0xffffff, 0.5);
  light.position.set(400, -200, 0);
  light.target.position.set(0, 0, 0);
  light.castShadow = false;
  scene.add(light);
}

function addGridHelper() {
  // const helper = new GridHelper(1000, 10)
  // scene.add(helper)
}

function addResizeListener() {
  window.addEventListener('resize', onResize)

  function onResize() {
    sizes.width = wrap.clientWidth
    sizes.height = wrap.clientHeight
    
    //- Update camera --------------------------------------
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    //- Update renderer --------------------------------------
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }

  onResize()
}

function addCamera() {
  camera = new PerspectiveCamera(75, 1)
  camera.position.set(0, 100, 200)
  scene.add(camera)
}

function addControls() {
  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
}

function addRenderer() {
  renderer = new WebGLRenderer({ canvas })

  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor( 0xcccccc, 1 ); // the default
}

function update() {
  // item.update()
  controls.update()
  renderer.render(scene, camera)
}

function initUpdate() {
  updater = setInterval(() => {update()}, 16)
}