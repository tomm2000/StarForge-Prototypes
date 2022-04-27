<template>
<div class="home">
  <h1>Prototypes for procedural solar system generation</h1>
  <h3>Source code on <a href="https://github.com/tomm2000/StarForge-Prototypes">github</a></h3>
  <h2>3D terrain generation:</h2>
  <ul>
    <li><DemoLink page="/terrain_1" text="Terrain 1 (3D mesh)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_2" text="terrain 2 (Sphere morphing)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_3" text="terrain 3 (Normal & noise map)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_4" text="terrain 4 (Terrain & shaders)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_5" text="terrain 5 (Customizable noise)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_6" text="terrain 6 (fragment shader & reflection shader)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_7" text="terrain 7 (GPGPU)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_8" text="terrain 8 (Texture mapping)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_9" text="terrain 9 (Texture mapping + ThreeJS)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_10" text="terrain 10 (Babylon + Node PBR)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_11" text="terrain 11 (Advanced noise)" class="link"></DemoLink></li>
    <li><DemoLink page="/terrain_12" text="terrain 12 (Reworked layer system)" class="link"></DemoLink></li>
  </ul>
  <h2>tests:</h2>
  <ul>
    <!-- <li><router-link class="link" to="/test/icosphere">icosphere</router-link></li> -->
  </ul>
</div>
</template>

<script lang="ts" setup>
</script>

<style lang="scss" scoped>
@import '@/assets/styles/colors.scss';

.home {
  padding-left: 2em;
  box-sizing: border-box;
  color: white;

  a {
    color: $color_accent_1_2;

    &:visited {
      color: $color_accent_1_3;
    }
  }

  .link {
    font-weight: normal;
    font-size: 1.1rem;
  }
}
</style>