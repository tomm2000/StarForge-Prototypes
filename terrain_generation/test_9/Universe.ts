import * as THREE from 'three'
import { AmbientLight, DataTexture, GridHelper, MeshStandardMaterial, TextureLoader, Vector2 } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// import { Terrestrial1 } from "./PlanetPrefabs/Terrestial1";
// import { PlanetPrefab } from "./PlanetPrefabs/PlanetPrefab";
import { CubeSphere } from './Sphere/CubeSphere';
import { uvToCube } from './Sphere/CubeTexture';
import { pointToUv, uvToPoint } from './Sphere/WarpTexture';
import { makeNoise3D } from 'open-simplex-noise';

export class Universe {
  private canvas:    HTMLCanvasElement
  protected scene:     THREE.Scene
  private sizes:     {width: number, height: number}
  private camera:    THREE.PerspectiveCamera
  private renderer:  THREE.WebGLRenderer
  private controls: OrbitControls
  private updateInterval: NodeJS.Timer | undefined
  private lastFrame: number = 0
  private fpsDisplay: HTMLElement | null = document.getElementById('divFps')
  private frameStep: number = 0

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas

    this.scene = new THREE.Scene()

    // let light = new THREE.DirectionalLight(0xffffff, 0.5);
    // light.position.set(-4, 4, -4);
    // light.target.position.set(0, 0, 0);
    // light.castShadow = false;
    // this.scene.add(light);

    // light = new THREE.DirectionalLight(0xffffff, 0.5);
    // light.position.set(4, -2, 0);
    // light.target.position.set(0, 0, 0);
    // light.castShadow = false;
    // this.scene.add(light);

    let light = new THREE.AmbientLight(0xffffff, 0.5);
    light.position.set(4, -2, 0);
    light.castShadow = false;
    this.scene.add(light);

    const helper = new GridHelper(10, 10)
    this.scene.add(helper)

    this.sizes = {
      width:  this.canvas.clientWidth,
      height: this.canvas.clientHeight
    }

    //- Resize --------------------------------------
    window.addEventListener('resize', () => {
      //- Update Sizes --------------------------------------
      this.sizes.width  = this.canvas.clientWidth
      this.sizes.height = this.canvas.clientHeight

      //- Update camera --------------------------------------
      this.camera.aspect = this.sizes.width / this.sizes.height
      this.camera.updateProjectionMatrix()

      //- Update renderer --------------------------------------
      this.renderer.setSize(this.sizes.width, this.sizes.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    //- Camera --------------------------------------
    this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height)
    this.camera.position.set(0, 1, 2)
    this.scene.add(this.camera)

    // Controls
    this.controls = new OrbitControls(this.camera, this.canvas)
    this.controls.enableDamping = true

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      // alpha: true
    })

    this.renderer.setSize(this.sizes.width, this.sizes.height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setClearColor( 0xcccccc, 1 ); // the default

    this.testInit()
  }

  update() {
    this.controls.update()

    this.renderer.render(this.scene, this.camera)

    this.frameStep ++

    if(this.fpsDisplay && this.frameStep == 20) {
      this.fpsDisplay.innerText = `fps: ${Math.floor(1000 / (performance.now() - this.lastFrame) * 20)}`
      this.lastFrame = performance.now()
      this.frameStep = 0
    }
  }

  initUpdate() {
    this.updateInterval = setInterval(this.update.bind(this), 1000/120)
  }

  stopUpdate() {
    if(this.updateInterval) { clearInterval(this.updateInterval) }
  }

  public dispose() {
    this.renderer.dispose()
  }

  testInit() {
    const textureSize = new Vector2(1200, 800)
    const dataSize = textureSize.x * textureSize.y
    const textureData = new Uint8Array(dataSize * 4)
    const noise = makeNoise3D(999)

    for(let i = 0; i < dataSize; i++) {
      const pos = new Vector2(i % textureSize.x, Math.floor(i / textureSize.x))

      const {position, normal} = uvToCube(pos.divide(textureSize))
      // const position = uvToPoint(pos.divide(textureSize))

      const elevation = (noise(position.x * 2, position.y * 2, position.z * 2) + 1) / 2

      // textureData[i*4+0] = pos.x * 255
      // textureData[i*4+1] = pos.x * 255
      // textureData[i*4+2] = pos.x * 255

      textureData[i*4+0] = elevation * 255
      textureData[i*4+1] = elevation * 255
      textureData[i*4+2] = elevation * 255

      // textureData[i*4+0] = Math.abs(normal.x) * 255
      // textureData[i*4+1] = Math.abs(normal.y) * 255
      // textureData[i*4+2] = Math.abs(normal.z) * 255
      textureData[i*4+3] = 255
    }

    const texture = new DataTexture(textureData, textureSize.x, textureSize.y)
    texture.needsUpdate = true

    // const texture = new TextureLoader().load('http://localhost:3001/images/testcube')

    const material = new MeshStandardMaterial({wireframe: false})

    material.map = texture
    // material.displacementMap = texture

    const sphere = new CubeSphere(undefined, material, textureData, textureSize)
    sphere.addToScene(this.scene)
  }
}
