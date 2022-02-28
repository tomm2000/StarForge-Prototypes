<template>
<ul>
  <li><router-link to="/terrain1">terrain 1 (obsolete)</router-link></li>
  <li><router-link to="/terrain2">terrain 2 (obsolete)</router-link></li>
  <li><router-link to="/terrain3">terrain 3 (obsolete)</router-link></li>
  <li><router-link to="/terrain4">terrain 4 (obsolete)</router-link></li>
  <li><router-link to="/terrain5">terrain 5 (obsolete)</router-link></li>
  <li><router-link to="/terrain6">terrain 6 (obsolete)</router-link></li>
  <li><router-link to="/terrain7">terrain 7 (latest)</router-link></li>
  <li><router-link to="/terrain8">terrain 8 (failed)</router-link></li>
  <!-- <li><router-link to="/system1">system 1</router-link></li> -->
</ul>
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
</style>


