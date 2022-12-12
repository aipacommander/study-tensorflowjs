<template>
    <div style="position: relative;">
      <video ref="mystery" width="100%" autoplay></video>
      <canvas ref="detection" style="position: absolute; left: 0;"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { doStuff } from '../lib/ssd/detect'

const mystery = ref<HTMLImageElement>(null)
const detection = ref<HTMLImageElement>(null)
onMounted(() => {
  doStuff(mystery, detection, 'filter')
})
</script>