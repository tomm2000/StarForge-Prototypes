<template>
<div class="page-wrap">
  <div class="menu box">
    <NuxtLink class="home-link" to="/">Home</NuxtLink>
    <span class="title">Terrain Generation prototype #{{ $route.params.test_id }}</span>
    <div class="description">{{description}}</div>
    <div class="controls">
      <input v-if="main != null && main.onUpload != undefined" @change="main.onUpload" type="file" class="file" />
      <input v-if="main != null && main.onEmpty != undefined"  @click="main.onEmpty" type="button" class="empty" value="create empty" />
      <div class="fps" ref="fps"></div>
    </div>
    
  </div>
  <div class="content box">
    <div class="canvas-wrap" ref="wrap"><canvas class="webgl canvas" ref="canvas"></canvas></div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { Ref } from 'vue';

const route = useRoute()
let canvas: Ref<HTMLCanvasElement> = ref()
let wrap: Ref<HTMLDivElement> = ref()
let fps : Ref<HTMLDivElement>= ref()
let description = ref('')
let main = ref(null)

onMounted(() => {
  import(`../terrain_generation/test_${route.params.test_id}/main.ts`).then((exp) => {
    let DisplayControllerFactory = exp.DisplayControllerFactory

    if(!(typeof route.params.test_id === 'string')) { throw 'test_id is not a string' }

    main.value = DisplayControllerFactory({
      id: parseFloat(route.params.test_id),
      canvas_element: canvas.value,
      wrap_element: wrap.value,
      fps_element: fps.value
    })

    description.value = main.value.getDescription()
  })
});

onUnmounted(() => {
  main.value.dispose()
  delete main.value
})

defineExpose({canvas, wrap, fps})
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
    display: grid;
    padding: 1rem;

    grid-template-rows: 2rem 4rem 1fr 6rem;
    grid-template-columns: 1fr;

    gap: .5rem;

    .home-link {
      grid-row: 1;
      grid-column: 1;
      font-weight: bold;
      color: $color_accent_1_2;
    }

    .title {
      grid-row: 2;
      grid-column: 1;
      color: $color_white_1;
      font-size: 1.4rem;
    }

    .description {
      grid-row: 3;
      grid-column: 1;
      color: $color_white_2;
      font-weight: normal;
    }

    .controls {
        grid-row: 4;
        grid-column: 1;
        display: flex;
        flex-direction: column;
        gap: .5rem;
      .fps {
        color: $color_white_2;
        font-weight: normal;
        justify-self: flex-end;
      }

      .file {
        color: $color_white_2;
        font-weight: normal;
        justify-self: flex-end;

      }

      .empty {
        // color: $color_white_2;
        font-weight: normal;
        justify-self: flex-end;
      }
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
        width: 100%;
        height: 100%;
        border-radius: .5rem;
        border: 2px solid $color_accent_1_2;
      }
    }
  }
}
</style>
