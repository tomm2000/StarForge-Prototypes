import { GUI } from "dat.gui";

export function destroyGUIrecursive(gui: GUI) {
  if(!gui.parent) {
    gui.destroy()
  } else {
    destroyGUIrecursive(gui.parent)
  }
}