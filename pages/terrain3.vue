<template>
<div id="main_container">
  <router-link id="home-link" to="/">home</router-link>
    <div id="animation_container">
      <!-- Animation -->
      <canvas class="webgl" id="animation_canvas"></canvas>
  </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { World } from '@/mechanics/terrain_generation/test3/World'

export default Vue.extend({
  name: 'IndexPage',
  mounted() {
    let canvas = new World('animation_canvas', 'animation_container')
    canvas.initUpdate()
  }
})
</script>

<style lang="scss" scoped>

#main_container {
  background-color: #3A3A98;
  height: 100vh;
  width: 100vw;
  padding: 1rem 1rem 1rem 1rem;
  box-sizing: border-box;
}

#home-link {
  color: white;
  max-height: 5%;
}

#animation_container {
  max-width: 100%;
  max-height: 95%;
  box-sizing: border-box;
}

canvas {
  width: 100%;
  height: 100%;
}
</style>
