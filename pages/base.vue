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
import { FlatWorld } from '@/mechanics/terrain_generation/test1/FlatWorld'

export default Vue.extend({
  name: 'IndexPage',
  mounted() {
    let canvas = new FlatWorld('animation_canvas', 'animation_container')
    canvas.initUpdate()
  }
})
</script>

<style lang="scss" scoped>

#main_container {
  background-color: #3A3A98;
  height: 100vh;
  width: 100vw;
  padding: 1rem 1rem 0 1rem;
  box-sizing: border-box;
}

#home-link {
  color: white;
}

/* #animation_container { } */

canvas {
  width: 100%;
  height: 100%;
}
</style>
