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
import { Universe } from '@/mechanics/terrain_generation/test12/Universe'
import { initFirebaseApp } from '~/mechanics/firebase/init';
import { fetchSchematics } from '~/mechanics/terrain_generation/test12/database/schematics'

type component_data = {
  universe: Universe | undefined,
  schematics: any
}

export default Vue.extend({
  name: 'IndexPage',
  data: () => { let data: component_data = {
    universe: undefined,
    schematics: undefined
  }; return data },
  computed: { },
  mounted() {
    initFirebaseApp()

    let canvas = document.getElementById('animation_canvas') as HTMLCanvasElement
    this.universe = new Universe(canvas)
  },
  methods: {  },
  destroyed() {
    // console.log('destroy')
    this.universe?.dispose()
  },
  
})
</script>

<style>
html { margin: 0; height: 100vh; width: 100vw; }

body { margin: 0; padding: 0; max-height: 100vh; max-width: 100vw; }

#main_container {
  background-color: #3A3A98;
  height: 100vh;
  width: 100vw;
  padding: 1rem 1rem 1rem 1rem;
  box-sizing: border-box;

  display: grid;
  grid-template-rows: 1fr 14fr 1fr;

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
