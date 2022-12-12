<template>
    <div id="main">
      <div class="container">
        <div class="canvas-wrapper" ref="canvasWrapper">
          <video id="video" ref="video" muted style="
            width: auto;
            height: auto;
            ">
          </video>
          <canvas id="output" ref="output" style="position: absolute; left: 0; bottom: 0;"></canvas>
          <div id="vrm" ref="vrm"></div>
        </div>
        <div id="scatter-gl-container" ref="scatterGlContainer" style="display: none"></div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { main } from '../lib/pose/detect'

const canvasWrapper = ref<HTMLDivElement>(null)
const video = ref<HTMLVideoElement>(null)
const output = ref<HTMLCanvasElement>(null)  // canvas
const scatterGlContainer = ref<HTMLDivElement>(null)
const vrm = ref<HTMLDivElement>()
onMounted(() => {
    main(
      video.value,
      output.value,
      canvasWrapper.value,
      scatterGlContainer.value,
      vrm.value
    )
})
</script>

<style>
#main {
}
#canvas-wrapper,
#scatter-gl-container {
}
</style>