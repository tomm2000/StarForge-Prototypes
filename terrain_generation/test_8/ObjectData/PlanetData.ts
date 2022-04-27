import { NoiseData } from "./NoiseData";

export type PlanetData = {
  type: 'terrestrial',
  radius: number,
  globalMinHeight: number | undefined,
  seed: number,
  noiseLayers: NoiseData[],
  debugNoise: boolean
}