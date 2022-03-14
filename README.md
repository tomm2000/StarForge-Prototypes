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
to deploy on gh-pages (**must edit the deploy.sh file first**):
```
yarn deploy
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

## Optimizations:
- position shader data only uses 2 of the 4 components of the vec4 (/,/,a,b), could use the other 2 for other stuff
- the position shaders can be compiled once for each type of noise, then reused if multiple instances of that noise exist
- the outputs of the noise controller could be cached and recaculate only the ones that got changed from the gui (and the ones depending on that who changed)

---
## 3D terrain generation prototypes:
<details>
  <summary>version 1 (threejs):</summary>

  - basic plane mesh morphing
</details>
<details>
 <summary>version 2 (threejs):</summary>

  - basic sphere mesh morphing
</details>
<details>
 <summary>version 3 (threejs):</summary>

  - basic procedural terrain with 3D noise
  - vertex normal shader
</details>
<details>
 <summary>version 4 (threejs):</summary>

  - terrain color shader on basic terrain
</details>
<details>
 <summary>version 5 (threejs):</summary>

  - terrain editor GUI
  - multi-layer noise
  - advanced noise settings: radius, amplitude, detail, min height, masks
  - auto/manual reloading
</details>
<details>
 <summary>version 6 (babylonjs):</summary>

  - custom reflection shader
  - terrain generation in vertex shader
</details>
<details>
 <summary>version 7 (babylonjs):</summary>

  - terrain generation on the GPU (GPGPU, not vertex shader)
</details>
<details>
 <summary>version 8 (babylonjs):</summary>

  - uv/texture mapping on cube sphere
</details>
<details>
 <summary>version 9 (threejs):</summary>

  - uv/texture mapping on cube sphere
  - terrain generated from 2d texture
</details>
<details>
 <summary>version 10 (babylonjs):</summary>

  - custom PBR node material
  - more advanced noise features (lacunarity, persistance, octaves, exponent)
  - noise seed, different seeds for noise layers
  - planet loading from json
  - planet downloading to json
</details>
<details>
 <summary>version 11 (babylonjs):</summary>

  - reworked noise system
  - reworked ui
  - separated editor functionality (ui) from visuals
</details>
<details>
 <summary>version 12 (babylonjs):</summary>

  - reworked noise system (again), now with separated steps and files for each noise step
  - reworked ui (again) to work with the new noise system
  - re-added support for loading and downloading
  - re-added support for masks
</details>


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