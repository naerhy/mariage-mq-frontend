<script setup lang="ts">
  // @ts-ignore
  const props = defineProps<{ text: string }>();
</script>

<template>
  <div></div>
</template>

<style scoped>
  div {
    animation: l1 1s linear infinite alternate;
  }

  div:before {
    content: v-bind("'" " + text + " "'");
  }

  @keyframes l1 {
    to {
      opacity: 0;
    }
  }
</style>
