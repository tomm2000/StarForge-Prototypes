import { PlanetDataJson } from "../../common/PlanetData/PlanetDataJson";

export class PlanetData {
  private data: PlanetDataJson = {
    type: 'terrestrial1',
    radius: 1,
    seed: Math.floor(Math.random() * 9999),
    noiseLayers: [],
    debugNoise: false,
    // https://nme.babylonjs.com/#XRRVZX#49
    materialId: 'XRRVZX#49',
    materialHeightMultiplier: 1,
    waterLevel: 0,
    oceanDepth: 1,
    oceanFloor: -.2
  }

  constructor(data: PlanetDataJson | undefined = undefined) {
    if(data) { this.data = data }
  }

  getData() { return this.data }
  setData(data: PlanetDataJson) { this.data = data }
}
