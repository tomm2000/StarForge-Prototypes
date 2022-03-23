<template>
<div class="home">
  <h1>Prototypes for procedural solar system generation</h1>
  <h3>Source code on <a href="https://github.com/tomm2000/StarForge-Prototypes">github</a></h3>
  <h2>3D terrain generation:</h2>
  <ul>
    <li><router-link class="link" to="/terrain1">terrain 1 (3D mesh)</router-link></li>
    <li><router-link class="link" to="/terrain2">terrain 2 (Sphere morphing)</router-link></li>
    <li><router-link class="link" to="/terrain3">terrain 3 (Normal & noise map)</router-link></li>
    <li><router-link class="link" to="/terrain4">terrain 4 (Terrain & shaders)</router-link></li>
    <li><router-link class="link" to="/terrain5">terrain 5 (Customizable noise)</router-link></li>
    <li><router-link class="link" to="/terrain6">terrain 6 (fragment shader & reflection shader)</router-link></li>
    <li><router-link class="link" to="/terrain7">terrain 7 (GPGPU)</router-link></li>
    <li><router-link class="link" to="/terrain8">terrain 8 (Texture mapping)</router-link></li>
    <li><router-link class="link" to="/terrain9">terrain 9 (Texture mapping + ThreeJS)</router-link></li>
    <li><router-link class="link" to="/terrain10">terrain 10 (Babylon + Node PBR)</router-link></li>
    <li><router-link class="link" to="/terrain11">terrain 11 (Advanced noise)</router-link></li>
    <li><router-link class="link" to="/terrain12">terrain 12 (Reworked layer system)</router-link></li>
    <!-- <li><router-link to="/system1">system 1</router-link></li> -->
  </ul>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { initFirebaseApp } from '~/mechanics/firebase/init'


export default Vue.extend({
  name: 'IndexPage',
  mounted() {
    initFirebaseApp()
  }
})
</script>


<style lang="scss" scoped>

.home {
  padding-left: 2em;
  box-sizing: border-box;
  color: white;

  a {
    color: rgb(168, 168, 168);

    &:visited {
      color: rgb(122, 122, 122);
      // color: rgb(255, 157, 255);
    }
  }

  .link {
    font-weight: normal;
    font-size: 1.1rem;
  }
}
</style>


