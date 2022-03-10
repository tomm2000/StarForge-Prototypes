<template>
<div id="home">
  <h1>Prototypes for procedural solar system generation</h1>
  <h3>Source code on <a href="https://github.com/tomm2000/StarForge-Prototypes">github</a></h3>
  <h2>3D terrain generation:</h2>
  <ul>
    <li><router-link to="/terrain1">terrain 1 (3D mesh)</router-link></li>
    <li><router-link to="/terrain2">terrain 2 (Sphere morphing)</router-link></li>
    <li><router-link to="/terrain3">terrain 3 (Normal & noise map)</router-link></li>
    <li><router-link to="/terrain4">terrain 4 (Terrain & shaders)</router-link></li>
    <li><router-link to="/terrain5">terrain 5 (Customizable noise)</router-link></li>
    <li><router-link to="/terrain6">terrain 6 (fragment shader & reflection shader)</router-link></li>
    <li><router-link to="/terrain7">terrain 7 (GPGPU)</router-link></li>
    <li><router-link to="/terrain8">terrain 8 (Texture mapping)</router-link></li>
    <li><router-link to="/terrain9">terrain 9 (Texture mapping + ThreeJS)</router-link></li>
    <li><router-link to="/terrain10">terrain 10 (Babylon + Node PBR)</router-link></li>
    <li><router-link to="/terrain11">terrain 11 (Advanced noise)</router-link></li>
    <li><router-link to="/terrain12">terrain 12 (Advanced noise)</router-link></li>
    <!-- <li><router-link to="/system1">system 1</router-link></li> -->
  </ul>
</div>
</template>

<script lang="ts">
import Vue from 'vue'


export default Vue.extend({
  name: 'IndexPage',
})
</script>

<style>
* {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

html { margin: 0; height: 100vh; width: 100vw; }

body { margin: 0; padding: 0; }

#home {
  padding-left: 2em;
  box-sizing: border-box;
}
</style>


