import { Mesh, MeshBuilder, Scene, VertexData } from "babylonjs";
import icomesh, { icoMesh } from "./lib/icomesh";

export class SphereMesh {
  // mesh: icoMesh

  constructor(scene: Scene) {
    let ico = icomesh(1, true)

    
    let customMesh = new Mesh('custom', scene)

    let positions = ico.vertices
    let indices = ico.triangles
    
    let vertexData = new VertexData()

    vertexData.positions = positions
    vertexData.indices = indices

    vertexData.applyToMesh(customMesh)
  }
}