<template>
<div id="main_container">
  <router-link id="home-link" to="/">home</router-link>
</div>
</template>

<script lang="ts">
import Vue from 'vue'
import { setupP5 } from '~/mechanics/solar_system_structure/test1/display'

export default Vue.extend({
  name: 'IndexPage',
  mounted() {
    setupP5()
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

  display: flex;
  flex-direction: column;
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
