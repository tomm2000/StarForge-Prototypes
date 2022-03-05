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
}

export class NoiseData {
  removeSelf: () => void

  noiseType: NoiseType = 'basic'
  amplitude: number = 1
  minHeight: number = 0
  scale: number = 1
  octaves: number = 1
  persistance: number = 0.5
  lacunarity: number = 2
  exponent: number = 1

  usePrevLayerAsMask: boolean = false
  useFirstLayerAsMask: boolean = false
  maskOnly: boolean = false
  maskMultiplier: number = 1


  constructor(removeSelf: () => void) {
    this.removeSelf = removeSelf
  }

  addGuiFolder(gui: GUI, name: string) {
    let folder = gui.addFolder(name)

    // ---- generation options
    let gen_folder = folder.addFolder('generation options')

    // gen_folder.add(this, 'noiseType', noiseTypeList)
    gen_folder.add(this, 'amplitude', 0.01, 5, 0.01)
    gen_folder.add(this, 'scale', 0.1, 5, 0.01)
    gen_folder.add(this, 'minHeight', -1, 1, 0.001)
    gen_folder.add(this, 'octaves', 1, 10, 1)
    gen_folder.add(this, 'persistance', 0.1, 1, 0.001)
    gen_folder.add(this, 'lacunarity', 1, 10, 0.1)
    gen_folder.add(this, 'exponent', 1, 5, 1)

    gen_folder.open()
    // -----------------------

    // ---- mask options
    let mask_folder = folder.addFolder('mask options')

    mask_folder.add(this, 'maskMultiplier', 0.1, 10, 0.1)
    mask_folder.add(this, 'maskOnly')
    mask_folder.add(this, 'usePrevLayerAsMask')
    mask_folder.add(this, 'useFirstLayerAsMask')
    // -----------------

    folder.add(this, 'removeSelf')
  }

  getNoiseId() { return noiseId(this.noiseType) }

  getJson() {
    const { noiseType, amplitude, minHeight, usePrevLayerAsMask, useFirstLayerAsMask, maskOnly, scale, maskMultiplier, exponent } = this
    const data: NoiseDataJson = { noiseType, amplitude, minHeight, usePrevLayerAsMask, useFirstLayerAsMask, maskOnly, scale, maskMultiplier, exponent }
    return data
  }
}