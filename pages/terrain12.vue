<template>
<div class="main_container">
  <div class="home-link-wrap"><router-link class="home-link" to="/">home</router-link></div>
  <div class="fps-wrap"><span class="fps" id="fps">fps: </span></div>
  <div class="upload-wrap"><input type="file" minlength="1" class="file-upload" @change="upload"></div>
  <div id="animation_container" class="canvas-wrap">
      <!-- Animation -->
    <canvas class="webgl canvas" id="canvas"></canvas>
  </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Universe } from '@/mechanics/terrain_generation/test12/Universe'
import { initFirebaseApp } from '~/mechanics/firebase/init';

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

    let canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.universe = new Universe(canvas)
  },
  methods: {
    upload(file: any) {
      let fr = new FileReader()

      fr.readAsText(file.target.files[0])

      fr.onload = () => {
        if(typeof fr.result != 'string') { return }

        this.universe?.setPlanetFromJson(fr.result)
      }
    },},
  destroyed() {
    // console.log('destroy')
    this.universe?.dispose()
  },
  
})
</script>

<style lang="scss" scoped>

.main_container {
  background: rgb(19, 19, 26);

  display: grid;
  grid-template-rows: 1fr 15fr 1fr;
  grid-template-columns: 5rem auto;

  padding: 2%;

  height: 100vh;
  width: 100vw;

  .home-link-wrap {
    grid-row: 1;
    grid-column: 1/3;

    display: flex;
    align-items: center;

    a {
        color: white; 
    }
  }

  .fps-wrap {
    grid-row: 3;
    grid-column: 1;

    display: flex;
    align-items: center;
    color: white; 
  }

  .upload-wrap {
    grid-row: 3;
    grid-column: 2;

    display: flex;
    align-items: center;
    color: white; 
  }

  .canvas-wrap {
    grid-row: 2;
    grid-column: 1/3;
    height: 100%;

    overflow: hidden;

    .canvas {
      height: 100%;
      width: 100%;
      border: 2px solid white;

      // max-height: 90vh;
      // max-width: 100vw;
    }
  }
}
</style>
