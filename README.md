# Prototypes for a procedural planet generator

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
- ### [This repository](https://github.com/DanRuta/GPGPU)
  for compute shaders (untill babylonjs and webGPU come around)
- ### [This repository](https://github.com/stegu/psrdnoise/)
  for noise computation in the shaders

---

## Todo:
### Optimization:
- position shaders can return only the elevation of each given position, reducing by 4 the amount of output data

## Possible fixes:
### Equirectangular UV warping:
- no fix found
### Cube mapping seams between faces
- adjacent faces should share pixels where they touch