import { InputBlock, Material, NodeMaterial } from "babylonjs";

export function setNMInputValue(material: Material | undefined, node_name: string, value: any) {
  if(!material || !(material instanceof NodeMaterial)) { return }
  
  const node = material.getBlockByName(node_name)

  if(!node || !(node instanceof InputBlock)) { return }

  node.value = value

  return material
}