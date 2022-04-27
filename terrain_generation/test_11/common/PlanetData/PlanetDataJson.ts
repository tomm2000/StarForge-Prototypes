import { NoiseDataJson } from "./NoiseDataJson"

export type PlanetTypes = 'terrestrial1'

export const planetTypeList: PlanetTypes[] = ['terrestrial1']

export type PlanetDataJson = {
  type: PlanetTypes
  radius: number
  seed: number
  noiseLayers: NoiseDataJson[]
  debugNoise: boolean
  materialId: string
  materialHeightMultiplier: number
  waterLevel: number
  oceanDepth: number
  oceanFloor: number
}