<template>
<div id="main_container">
  <router-link id="home-link" to="/">home</router-link>
  <div id="divFps">fps: </div>
  <div id="animation_container">
      <!-- Animation -->
    <canvas class="webgl" id="animation_canvas"></canvas>
  </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Universe } from '@/mechanics/terrain_generation/test8/Universe'

type component_data = {
  universe: Universe | undefined
}

export default Vue.extend({
  name: 'IndexPage',
  data: () => { let data: component_data = {
    universe: undefined
  }; return data },
  mounted() {
    let canvas = document.getElementById('animation_canvas') as HTMLCanvasElement
    this.universe = new Universe(canvas)
  },
  methods: {
    // update() {
    // }
  },
  destroyed() {
    // console.log('destroy')
    this.universe?.dispose()
  },
  
})
</script>

<style lang="scss" scoped>

#main_container {
  background-color: #3A3A98;
  height: 100vh;
  width: 100vw;
  padding: 1rem 1rem 1rem 1rem;
  box-sizing: border-box;

  display: grid;
  grid-template-rows: 1fr 10fr;

}

#home-link {
  color: white;
  /* max-height: 5%;  */
  /* box-sizing: border-box; */
  grid-row: 1;
  width: fit-content;
}

#animation_container {
  /* max-width: 90vw; */
  /* max-height: 10%; */
  /* box-sizing: border-box; */
  grid-row: 2;
  display: flex;
  justify-content: center;
  /* align-items: center; */
}

canvas {
  width: 100%;
  max-width: 90%;
  max-height: 90%;
  /* height: 100%; */
}
</style>
