<template>
    <h1>Videoテスト</h1>
    <video ref="videoRef" muted />
    <canvas ref="canvasRef"></canvas>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

const resolution = { w: 1080, h: 720 }
const setupCamera = async (video: HTMLVideoElement) => {
    return navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: { ideal: resolution.w },
            height: { ideal: resolution.h }
        }
    }).then(function (stream) {
        video.srcObject = stream
    })
}

const canvasUpdate = (video, canvas, ctx) => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    requestAnimationFrame(() => {
        canvasUpdate(video, canvas, ctx)
    })
};

const videoRef = ref<HTMLVideoElement>()
const canvasRef = ref<HTMLCanvasElement>()
onMounted(async () => {
    const video = videoRef.value
    video.style.display = 'none'
    // const media = await setupCamera(video)
    const media = navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: { ideal: resolution.w },
            height: { ideal: resolution.h }
        }
    }).then((stream) => {
        video.srcObject = stream
    })

    video.play()
    const canvas = canvasRef.value
    canvas.width = 480
    canvas.height = 360
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    canvasUpdate(video, canvas, ctx)
})
</script>