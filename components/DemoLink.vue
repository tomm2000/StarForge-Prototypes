<template>
  <NuxtLink :to="page" class="link">{{ text }}</NuxtLink>
</template>

<script lang='ts' setup>
defineProps({
  page: { required: true, type: String },
  text: { required: true, type: String },
})
</script>

<style lang='scss' scoped>
.link {
  font-weight: normal;
  font-size: 1.3rem;
}
</style>