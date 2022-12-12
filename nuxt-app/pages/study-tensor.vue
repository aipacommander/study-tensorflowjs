<template>
    <h1>
        テスト
    </h1>
    <div>
        <a href="#">テスト</a>
        <video id="video" muted></video>
        <canvas id="canvas"></canvas>
    </div>
</template>

<script setup lang="ts">
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import { onMounted } from 'vue';

const model = poseDetection.SupportedModels.BlazePose
const detectorConfig = {
  runtime: 'tfjs',
  modelType: 'full'
}

onMounted(async() => {
    const detector = await poseDetection.createDetector(model, detectorConfig)
    const video = document.getElementById('video')
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
    }).then(async(stream) => {
        video.srcObject = stream
        video.play()
        const canvas = document.getElementById('canvas')
        const ctx = canvas.getContext('2d')
        canvas.setAttribute("width", 100)
        canvas.setAttribute("height", 100)
        ctx.drawImage(video, 0, 0, 100, 100)
        const poses = await detector.estimatePoses(canvas)
        console.log(poses)
    }).catch(e => {
        console.log(e)
    })
})


</script>