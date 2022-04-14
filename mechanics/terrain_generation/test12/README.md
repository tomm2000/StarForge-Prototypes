# **Info about the project structure**

## Planet Json representation
![Json representation](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/project_structure/planet_data.png?raw=true)

## Update cycle
![Json representation](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/project_structure/update_cycle.png?raw=true)

## Creation cycle
![Json representation](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/project_structure/creation_cycle.png?raw=true)

## GUI cycle
![Json representation](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/project_structure/gui_cycle.png?raw=true)

----
----
# **Noise Layers**
### **here follows a description of the current noise layer types**

each noise type extends the another type inherithing its properties but not its generation code!

all inheritance chains start from the base noise type.

the base noise type has 2 properties (which all other noise types inherit):

**-mask_index**: the index of the layer to use for this noise layer.

**-mask_only**: if true, this noise type will only be used as a mask layer, and will not contribute to the elevation.


----
## **Basic Noise**

This is a basic perlin noise. It is used as a base for many other noise types.

it's properties are:\
**-seed**: the seed for the noise generation

**-amplitude**: the amplitude of the noise (how much it will affect the elevation)

**-frequency**: the frequency of the noise ("how narrow are the gaps between peaks")

**-octaves**: the number of octaves to use for the noise generation (how many layers of perlin noise are 'stacked' on each other)

**-persistance**: the persistance of the noise (how much the amplitude decreases with each octave)

**-lacunarity**: the lacunarity of the noise (how much the frequency increases with each octave)

**-exponent** the exponentiation of the noise (the final elevation of the noise will be raised to this power, higher values will make flatter valleys and pointer peaks)

**-mantain_sign**: if true, the noise will be forced to be positive or negative, depending on the sign of the original amplitude.

### **Some examples of basic noise**

Basic noise with simple settings:\
![Basic 1](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/noise_layers/basic_1.png?raw=true)

An example demostrating the use of octaves\
![Basic 2](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/noise_layers/basic_2.png?raw=true)

An example demostrating the use of the exponent\
![Basic 3](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/noise_layers/basic_3.png?raw=true)

An example demostrating the use of the mantain sign\
![Basic 4](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/noise_layers/basic_4.png?raw=true)

----
## **Positive Noise**

This is very similar to the basic noise, but it will only generate positive values. (or negative is the amplitude is negative)

the properties are the same as the basic noise.ù

----
## **Ridge Noise**

This noise will generate terrain simulating ridges. Its properties are the same as the basic noise.

### **Some examples of ridge noise**

An example of ridge noise using basic values\
![Ridge 1](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/noise_layers/ridge_1.png?raw=true)

An example of ridge demostrating more advanced settings\
![Ridge 2](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/noise_layers/ridge_2.png?raw=true)

Mantain sign can be used to create insets and channels in the terrain\
![Ridge 3](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/noise_layers/ridge_3.png?raw=true)

----
## **Ocean Modifier**

The ocean modifier layer is a special layer that does not directly contribute to the elevation. Its purpose is to modify the elevation of the previus layer.

it's properties are:\

**-ocean_floor**: the elevation of the ocean floor, elevation values under this level will be smoothed out

**-ocean_depth**: the depth of the ocean, elevation values under the ocean level will be multiplied by this amount

**-ocean_level**: the elevation of the ocean level, elevation values under this level will be multiplied by the depth value

**-floor_flatten**: how much the floor will be flattened

----
## **Mask**

This layer is optimized to be used as a mask. It extends the basic layer, and adds the following properties:\

**-vertical_shift**: the vertical offset of the noise

**-floor**: the elevation of the floor, values under this level will be clamped

**-ceiling**: the elevation of the ceiling, values above this level will be clamped

### **Some examples of ridge noise**

An example of mask noise using basic values\
![Mask 1](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/noise_layers/mask_1.png?raw=true)

An example demostrating the use of floor and ceiling\
![Mask 2](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/noise_layers/mask_2.png?raw=true)

----
## **Crater**

This layer is used to add craters to the surface.
The crater settings are pre-generated and stored in the project. The user can select the distribution and the amount of such pre-generated craters.

Its properties are: \
**-crater_amount**: the amount of craters to add to the surface

**-seed**: the seed for the crater placement

**-crater_min**: the minimum index of the crater to use. Lower values correspond to smaller craters

**-crater_max**: the maximum index of the crater to use. Higher values correspond to larger craters

**-size_distribution**: a coefficent that determines the distribution of smaller craters vs bigger craters, higher values will make smaller craters more common.

### **Some examples of crater noise**
a basic example of the craterlayer\
![Crater 1](https://github.com/tomm2000/StarForge-Prototypes/blob/master/mechanics/terrain_generation/test12/assets/noise_layers/crater_1.png?raw=true)