<script setup lang="ts">
const isDark = useDark()
</script>

<template>
  <img v-if="isDark" src="/logo-dark.svg" title="hujiacheng @ hujiacheng.me">
  <img v-else src="/logo.svg" title="hujiacheng @ hujiacheng.me">
</template>
