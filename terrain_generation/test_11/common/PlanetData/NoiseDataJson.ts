export type NoiseType = 'basic' | 'positive' | 'ridge' | 'mask'

export const noiseTypeList: NoiseType[] = ['basic', 'positive', 'ridge', 'mask']

export function noiseId(type: NoiseType): number { return noiseTypeList.indexOf(type) }

export type NoiseDataJson = {
  noiseType: NoiseType
  amplitude: number
  minHeight: number
  prevMaskUse: -1 | 0 | 1
  firstMaskUse: -1 | 0 | 1
  maskOnly: boolean
  scale: number
  maskMultiplier: number
  exponent: number
  octaves: number
  persistance: number
  lacunarity: number
  index: number
}