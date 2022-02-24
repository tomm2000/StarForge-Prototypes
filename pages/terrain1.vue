<template>
  <div id="main_container">
    <router-link id="home-link" to="/">home</router-link>
    <div id="animation_container">
      <canvas class="webgl" id="animation_canvas"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { FlatWorld } from "@/mechanics/terrain_generation/test1/FlatWorld";

export default Vue.extend({
  name: "IndexPage",
  mounted() {
    let canvas = new FlatWorld("animation_canvas", "animation_container");
    canvas.initUpdate();
  },
});
</script>

<style>
html {
  margin: 0;
  height: 100vh;
  width: 100vw;
}

body {
  margin: 0;
  padding: 0;
}

#main_container {
  background-color: #3a3a98;
  height: 100vh;
  width: 100vw;
  padding: 1rem 1rem 1rem 1rem;
  box-sizing: border-box;
}

#home-link {
  color: white;
}

#animation_container {
  max-width: 100%;
  max-height: 100%;
  box-sizing: border-box;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
