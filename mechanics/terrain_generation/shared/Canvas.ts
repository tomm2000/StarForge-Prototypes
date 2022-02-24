import * as THREE from 'three'
import { AmbientLight, GridHelper } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DrawObject } from './DrawObject'

export class Canvas {
  private canvas:    HTMLElement
  private container: HTMLElement
  protected scene:     THREE.Scene
  private sizes:     {width: number, height: number}
  private camera:    THREE.PerspectiveCamera
  private renderer:  THREE.WebGLRenderer
  private clock:     THREE.Clock
  private doUpdate:  boolean
  private controls: OrbitControls
  
  private drawObjects: Set<DrawObject>

  constructor(canvas_id: string, container_id: string) {
    this.doUpdate = false
    this.drawObjects = new Set()

    // Canvas
    this.canvas    = document.getElementById(canvas_id)!
    this.container = document.getElementById(container_id)!

    this.scene = new THREE.Scene()

    let light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(-400, 400, -400);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    this.scene.add(light);

    // let lightHelper = new THREE.DirectionalLightHelper(light)
    // this.scene.add(lightHelper)


    light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(400, -200, 0);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    this.scene.add(light);

    // lightHelper = new THREE.DirectionalLightHelper(light)
    // this.scene.add(lightHelper)


    // const ambient = new AmbientLight(0xffffff, 0.2)
    // this.scene.add(ambient)

    const helper = new GridHelper(1000, 10)
    this.scene.add(helper)

    this.sizes = {
      width:  this.container.clientWidth,
      height: this.container.clientHeight
    }

    //- Resize --------------------------------------
    window.addEventListener('resize', () => {
      //- Update Sizes --------------------------------------
      this.container = document.getElementById('animation_container')!

      this.sizes.width  = this.container.clientWidth
      this.sizes.height = this.container.clientHeight

      //- Update camera --------------------------------------
      this.camera.aspect = this.sizes.width / this.sizes.height
      this.camera.updateProjectionMatrix()

      //- Update renderer --------------------------------------
      this.renderer.setSize(this.sizes.width, this.sizes.height)
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })

    //- Camera --------------------------------------
    this.camera = new THREE.PerspectiveCamera(75, this.sizes.width / this.sizes.height)
    this.camera.position.set(0, 100, 200)
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

    this.clock = new THREE.Clock()
  }

  update(_self: Canvas | undefined = undefined) {
    let self: Canvas = this

    if(_self) { self = _self }



    // Update objects
    for(let obj of self.drawObjects) {
      obj.update()
    }

    //// Update Orbital Controls
    this.controls.update()

    self.renderer.render(self.scene, self.camera)

    // if(self.doUpdate) { window.requestAnimationFrame(() => {self.update(self)}) }
  }

  initUpdate() {
    this.doUpdate = true
    // this.update()

    setInterval(() => {this.update(this)}, 16)
  }

  /** NOT WORKING */
  stopUpdate() {
    this.doUpdate = false
  }

  addObject(obj: DrawObject) {
    this.scene.add(obj.get3D())
    this.drawObjects.add(obj)
  }

  removeObject(obj: DrawObject) {
    this.drawObjects.delete(obj)
    this.scene.remove(obj.get3D())
  }
}