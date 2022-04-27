import { GUI, GUIController } from 'dat.gui';
import { noiseTypeList } from '../ObjectData/NoiseData';
import { PlanetData } from '../ObjectData/PlanetData';
// import { PlanetPrefab } from '../PlanetPrefabs/PlanetPrefab';

export function getPlanetGUI(planetData: PlanetData, planet: any): GUI {
  const gui = new GUI()

  gui.add(planet, 'reload')
  gui.add(planet, 'autoUpdate')
  gui.add(planetData, 'downloadJson')

  planetData.generateGuiFolder(gui)
  
  gui.close()

  return gui
}
