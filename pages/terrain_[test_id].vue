<template>
<div class="page-wrap">
  <div class="menu box">
    <NuxtLink class="home-link" to="/">Home</NuxtLink>
    <span class="title">Terrain Generation prototype #{{ $route.params.test_id }}</span>
    <div class="description">{{description}}</div>
  </div>
  <div class="content box">
    <div class="canvas-wrap" ref="wrap"><canvas class="webgl canvas" ref="canvas"></canvas></div>
  </div>
</div>
</template>

<script lang="ts" setup>
const route = useRoute()
let canvas = ref()
let wrap = ref()
let description = ref('')
let module = ref(null)

onMounted(() => {
  import(`/terrain_generation/test_${route.params.test_id}/main`).then((_module) => {
    if(_module.init === undefined || _module.dispose === undefined) {
      throw new Error(`canvas initializer for test #${route.params.test_id} is undefined`)
    }

    module.value = _module

    description.value = module.value.init(route.params.test_id, canvas.value, wrap.value)
  })
});

onUnmounted(() => {
  module.value.dispose()
})

defineExpose({canvas, wrap})
</script>

<style lang="scss" scoped>
@import '@/assets/styles/colors.scss';

.page-wrap {
  display: flex;
  height: 100vh;
  width: 100vw;
  max-width: 100vw;

  padding: 1.5rem;
  gap: 1.5rem;

  .box {
    background: $color_background_2;
    height: 100%;
    border-radius: .5rem;
    border: 1px solid $color_white_5;
  }

  .menu {
    min-width: 20rem;
    width: 20rem;
    display: flex;
    padding: 1rem;
    flex-direction: column;

    gap: 1rem;

    .home-link {
      font-weight: bold;
      color: $color_accent_1_2;
    }

    .title {
      color: $color_white_1;
      font-size: 1.4rem;
    }

    .description {
      color: $color_white_2;
      font-weight: normal;
    }
  }

  .content {
    flex: 1;
    padding: 1rem;

    .canvas-wrap {
      width: 100%;
      height: 100%;
      overflow: hidden;

      .canvas {
        border-radius: .5rem;
        border: 2px solid $color_accent_1_2;
      }
    }
  }
}
</style>
