import { GUI } from "dat.gui";
import { Mesh, ShaderMaterial, Vector3 } from "babylonjs";
import { IcoSphereMesh } from "../IcoSphere/IcoSphereMesh";
import { NoiseData } from "../ObjectData/NoiseData";
import { PlanetData } from "../ObjectData/PlanetData";

export type PlanetPrefab = {
  // icoSphereMesh: IcoSphereMesh
  planetData: PlanetData
  gui: GUI
  
  getMaterial(): ShaderMaterial
  getMesh(): Mesh
  reload(): void
  addNoiseLayer(): void
}