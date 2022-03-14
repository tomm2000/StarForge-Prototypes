# Prototypes for a procedural planet generator

This repository holds the incremental prototypes produced while learning about 3D graphics (mainly concerning the browser) and trying to build a procedural planet generator.

The plan is to use the (eventual) final version of this project for another standalone project of mine

---

[live demo](https://tomm2000.github.io/StarForge-Prototypes/)

## How to compile:
to run the project in development mode
```
yarn dev
```
to generate a static page:
```
yarn generate
```

---

## Resources used:
- ### [Babylon js](https://www.babylonjs.com/):
  for most of the 3D stuff
- ### [dat.gui](https://github.com/dataarts/dat.gui)
  for the gui
- ### [This repository](https://github.com/tomm2000/GPGPU)
  for compute shaders (untill babylonjs and webGPU come around)
- ### [This repository](https://github.com/stegu/psrdnoise/)
  for glsl noise code
---

## Todo:
### Optimization:
- position shaders can return only the elevation of each given position, reducing by 4 the amount of output data
- the position shaders can be compiled once for each type of noise, then reused if multiple instances of that noise exist

## Possible fixes:
### Equirectangular UV warping (no longer used):
- no fix found
### Cube mapping seams between faces (no longer used):
- adjacent faces should share pixels where they touch

---
## 3D terrain generation prototypes:
### **version 1 (threejs):**
- basic plane mesh morphing
### **version 2 (threejs):**
- basic sphere mesh morphing
### **version 3 (threejs):**
- basic procedural terrain with 3D noise
- vertex normal shader
### **version 3 (threejs):**
- terrain color shader on basic terrain
### **version 5 (threejs):**
- terrain editor GUI
- multi-layer noise
- advanced noise settings: radius, amplitude, detail, min height, masks
- auto/manual reloading
### **version 6 (babylonjs):**
- custom reflection shader
- terrain generation in vertex shader
### **version 7 (babylonjs):**
- terrain generation on the GPU (GPGPU, not vertex shader)
### **version 8 (babylonjs):**
- uv/texture mapping on cube sphere
### **version 9 (threejs):**
- uv/texture mapping on cube sphere
- terrain generated from 2d texture
### **version 10 (babylonjs):**
- custom PBR node material
- more advanced noise features (lacunarity, persistance, octaves, exponent)
- noise seed, different seeds for noise layers
- planet loading from json
- planet downloading to json
### **version 11 (babylonjs):**
- reworked noise system
- reworked ui
- separated editor functionality (ui) from visuals
### **version 12 (babylonjs):**
- reworked noise system (again), now with separated steps and files for each noise step
- reworked ui (again) to work with the new noise system
- re-added support for loading and downloading
- re-added support for masks


# Some screenshots showcasing the improvements over the terrain generation
### first test with procedural terrain
![very old screenshot](https://github.com/tomm2000/StarForge-Prototypes/blob/master/assets/gallery/very_old.png?raw=true)

---

### first iteration of customized noise
![terrain 06/03/22](https://github.com/tomm2000/StarForge-Prototypes/blob/master/assets/gallery/terrain_06_03_22.png?raw=true)

---

### first iteration of multiple noise layers & custom shader
![terrain 06/03/22](https://github.com/tomm2000/StarForge-Prototypes/blob/master/assets/gallery/terrain_08_03_22.png?raw=true)

---

### more advanced noise features and better shader coloring
![terrain 06/03/22](https://github.com/tomm2000/StarForge-Prototypes/blob/master/assets/gallery/terrain_09_03_22.png?raw=true)