import { GUI } from "dat.gui";

export function destroyGUIrecursive(gui: GUI | undefined) {
  if(!gui) { return }

  if(!gui.parent) {
    try {
      gui.destroy()
    } catch(e) {}
  } else {
    destroyGUIrecursive(gui.parent)
  }
}