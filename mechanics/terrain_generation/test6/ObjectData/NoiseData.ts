import { Noise3D } from "open-simplex-noise/lib/3d";

export type NoiseData = {
  noise: Noise3D,
  removeSelf: () => void,
  amplitude: number,
  minHeight: number,
  usePrevLayerAsMask: boolean,
  useFirstLayerAsMask: boolean,
  maskOnly: boolean,
  detail: number,
  index: number
}