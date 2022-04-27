import { GUI } from "dat.gui";
import { Mesh, Vector3 } from "three";
import { IcoSphereMesh } from "../IcoSphere/IcoSphereMesh";
import { NoiseData } from "../ObjectData/NoiseData";
import { PlanetData } from "../ObjectData/PlanetData";

export type PlanetPrefab = {
  // icoSphereMesh: IcoSphereMesh
  planetData: PlanetData
  gui: GUI
  
  getPointOnPlanet(pointOnUnitSphere: Vector3): Vector3
  getMesh(): Mesh
  reload(): void
  addNoiseLayer(): void
}