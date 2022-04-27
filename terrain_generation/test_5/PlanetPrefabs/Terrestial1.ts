import { GUI } from "dat.gui";
import { makeNoise3D  } from "open-simplex-noise";
import { Noise3D } from "open-simplex-noise/lib/3d";
import { Mesh, Vector3 } from "three";
import { getPlanetGUI } from "../GUI/SpaceObjectGUI";
import { IcoSphereMesh } from "../IcoSphere/IcoSphereMesh";
import { IcoSphereShader } from "../IcoSphere/icoSphereShader";
import { NoiseData } from "../ObjectData/NoiseData";
import { PlanetData } from "../ObjectData/PlanetData";
import { PlanetPrefab } from "./PlanetPrefab";

export class Terrestrial1 implements PlanetPrefab {
  icoSphereMesh: IcoSphereMesh
  // icoSphereMesh: IcoSphereShader
  planetData: PlanetData
  gui: GUI
  private autoUpdate: boolean = false
  private updateInterval: NodeJS.Timer | undefined
  private tmpSeed: number

  constructor(radius: number = 100) {
    const seed = Math.floor(Math.random()*9999)
    this.tmpSeed = seed

    this.planetData = {
      globalMinHeight: 0,
      radius,
      seed,
      type: "terrestrial",
      noiseLayers: [],
      debugNoise: false
    }

    this.gui = getPlanetGUI(this.planetData, this)

    this.icoSphereMesh = new IcoSphereMesh(32, this.getPointOnPlanet.bind(this))
    // this.icoSphereMesh = new IcoSphereShader(1)

    this.updateInterval = setInterval(() => {
      if(this.autoUpdate) {
        this.reload()
      }
    }, 32)
  }

  getPointOnPlanet(pointOnUnitSphere: Vector3): Vector3 {
    const data = this.planetData

    if(this.tmpSeed != data.seed) {
      // data.noiseLayers[0].noise = makeNoise3D(data.seed*9999)
      this.tmpSeed = data.seed

      for(let i = 0; i < data.noiseLayers.length; i++) {
        const layer = data.noiseLayers[i]
        // layer.noise =  makeNoise3D(data.seed + i)
        console.log('here!')
      }
    }

    let elevation      = 0;
    let base_elevation = 1;
    let prev_elevation = 1;

    for(let layer_index = 0; layer_index < data.noiseLayers.length; layer_index++) {
    //   PlanetNoise layer = noiseLayers[layer_index];
      const layer = data.noiseLayers[layer_index]

      let {x,y,z} = pointOnUnitSphere.clone().multiplyScalar(layer.detail)
      let level_elevation = layer.noise(x,y,z)

      level_elevation = (level_elevation+1) / 2 * layer.amplitude
      level_elevation = Math.max(0, level_elevation - (layer.minHeight || 0))

      let mask = 1

      if(layer.useFirstLayerAsMask) {
        mask = base_elevation
      }

      if(layer_index == 0) {
        base_elevation = level_elevation
      }

      if(layer.usePrevLayerAsMask && layer_index >= 1) {
        mask = prev_elevation
      }

      if(!layer.maskOnly) {
        prev_elevation = level_elevation * mask
        elevation += level_elevation * mask
      } else {
        prev_elevation = (level_elevation * mask) == 0 ? 0 : .5

        if(this.planetData.debugNoise){
          elevation += (level_elevation * mask) == 0 ? 0 : .5 //* for debugging noise only!
        }
      }
    }

    elevation = Math.max(0, elevation - (data.globalMinHeight || 0));

    return pointOnUnitSphere.multiplyScalar(data.radius * (elevation+1))
  }

  reload() {
    this.icoSphereMesh.updateMesh()
  }
  
  addNoiseLayer(): void {
    const index = this.planetData.noiseLayers.length

    this.planetData.noiseLayers.push({
      noise: makeNoise3D(this.planetData.seed),
      removeSelf: () => {
        this.planetData.noiseLayers.splice(index, 1)
        this.updateGUI()
      },
      amplitude: 1,
      minHeight: 0,
      useFirstLayerAsMask: false,
      usePrevLayerAsMask: false,
      maskOnly: false,
      detail: 1,
      index: index
    })

    this.updateGUI()
  }

  updateGUI() {
    this.gui.destroy()
    this.gui = getPlanetGUI(this.planetData, this)
  }
  
  getMesh(): Mesh { return this.icoSphereMesh.getMesh() }

  dispose() {
    if(this.updateInterval) { clearInterval(this.updateInterval) }
  }
}