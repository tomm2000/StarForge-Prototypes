<template>
<div id="main_container">
  <router-link id="home-link" to="/">home</router-link>
  <button @click="update">update mesh</button>
  <div id="animation_container">
      <!-- Animation -->
    <canvas class="webgl" id="animation_canvas"></canvas>
  </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Universe } from '@/mechanics/terrain_generation/test5/Universe'

type component_data = {
  canvas: Universe | undefined
}

export default Vue.extend({
  name: 'IndexPage',
  data: () => { let data: component_data = {
    canvas: undefined
  }; return data },
  mounted() {
    this.canvas = new Universe('animation_canvas', 'animation_container')
    this.canvas.initUpdate()
  },
  methods: {
    update() {
      this.canvas?.regenerateMeshes()
    }
  },
  destroyed() {
    console.log('destroy')
    this.canvas?.disposte()
  }
})
</script>

<style>
html { margin: 0; height: 100vh; width: 100vw; }

body { margin: 0; padding: 0; }

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
