import { GUI } from "dat.gui";
import { Mesh, ShaderMaterial, Vector3 } from "babylonjs";
import { IcoSphereMesh } from "../IcoSphere/IcoSphereMesh";
import { NoiseData } from "../ObjectData/NoiseData";
import { PlanetData } from "../ObjectData/PlanetData";
import { positionShader } from "../IcoSphere/positionShader";

export type PlanetPrefab = {
  icoSphereMesh: IcoSphereMesh
  planetData: PlanetData
  gui: GUI
  
  getMesh(): Mesh
  reload(): void
  addNoiseLayer(): void
  getPositionShader(): positionShader
  
}