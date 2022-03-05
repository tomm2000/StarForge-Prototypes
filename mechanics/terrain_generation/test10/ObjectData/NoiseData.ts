import { GUI } from "dat.gui"

export type NoiseType = 'basic'

export const noiseTypeList: NoiseType[] = ['basic']

export function noiseId(type: NoiseType): number { return noiseTypeList.indexOf(type) }

export type NoiseDataJson = {
  noiseType: NoiseType
  amplitude: number
  minHeight: number
  usePrevLayerAsMask: boolean
  useFirstLayerAsMask: boolean
  maskOnly: boolean
  scale: number
  maskMultiplier: number
  exponent: number
  octaves: number
  persistance: number
  lacunarity: number
  index: number
}

export function defaultNoiseData(index: number): NoiseDataJson {
  return {
    noiseType: 'basic',
    amplitude: 1,
    minHeight: 0,
    scale: 1,
    octaves: 1,
    persistance: 0.5,
    lacunarity: 2,
    exponent: 1,
  
    usePrevLayerAsMask: false,
    useFirstLayerAsMask: false,
    maskOnly: false,
    maskMultiplier: 1,
    
    index
  }
}

export function addNoiseLayerGui(data: NoiseDataJson, gui: GUI, name: string): GUI {
  let folder = gui.addFolder(name)

  // ---- generation options
  let gen_folder = folder.addFolder('generation options')

  // gen_folder.add(this, 'noiseType', noiseTypeList)
  gen_folder.add(data, 'amplitude', 0.01, 5, 0.01)
  gen_folder.add(data, 'scale', 0.1, 5, 0.01)
  gen_folder.add(data, 'minHeight', -1, 1, 0.001)
  gen_folder.add(data, 'octaves', 1, 10, 1)
  gen_folder.add(data, 'persistance', 0.1, 1, 0.001)
  gen_folder.add(data, 'lacunarity', 1, 10, 0.1)
  gen_folder.add(data, 'exponent', 1, 5, 1)

  gen_folder.open()
  // -----------------------

  // ---- mask options
  let mask_folder = folder.addFolder('mask options')

  mask_folder.add(data, 'maskMultiplier', 0.1, 10, 0.1)
  mask_folder.add(data, 'maskOnly')
  mask_folder.add(data, 'usePrevLayerAsMask')
  mask_folder.add(data, 'useFirstLayerAsMask')
  // -----------------

  return folder
}