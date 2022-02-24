import { GUI, GUIController } from 'dat.gui';
import { PlanetData } from '../ObjectData/PlanetData';
import { PlanetPrefab } from '../PlanetPrefabs/PlanetPrefab';

export function getPlanetGUI(planetData: PlanetData, planet: PlanetPrefab): GUI {
  const gui = new GUI()

  gui.add(planet, 'reload')
  gui.add(planet, 'autoUpdate')

  let p_data = gui.addFolder('planet data')
  p_data.add(planetData, 'radius', 0.1, 2, 0.01)
  p_data.add(planetData, 'globalMinHeight', -1, 1, 0.001)
  p_data.add(planetData, 'seed', 0, 9999)
  p_data.add(planet, 'addNoiseLayer')

  let p_noise = gui.addFolder('noise layers')
  p_noise.add(planetData, 'debugNoise')

  planetData.noiseLayers.forEach((layer, index) => {
    let layer_folder = p_noise.addFolder(`layer [${index}]`)
    layer_folder.add(layer, 'amplitude', -1, 1, 0.001)
    layer_folder.add(layer, 'detail', 0.1, 5, 0.01)
    layer_folder.add(layer, 'minHeight', -1, 1, 0.001)
    layer_folder.add(layer, 'maskOnly')
    layer_folder.add(layer, 'usePrevLayerAsMask')
    layer_folder.add(layer, 'useFirstLayerAsMask')
    layer_folder.add(layer, 'removeSelf')
  })

  gui.close()

  return gui
}
