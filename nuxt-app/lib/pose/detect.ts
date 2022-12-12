import * as posedetection from '@tensorflow-models/pose-detection'
import { Camera } from './camera'
import { modelConfig } from './consistans'
// import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm'
import { MyVRM } from './my-vrm'
import '@mediapipe/pose'

// console.log(tfjsWasm.version_wasm)
// tfjsWasm.setWasmPaths(
//     `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${
//         tfjsWasm.version_wasm}/dist/`);

import * as tf from '@tensorflow/tfjs'
tf.setBackend('webgl')


async function createDetector() {
    const model = posedetection.SupportedModels.BlazePose
    const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'lite',
    }
    return posedetection.createDetector(model, detectorConfig)
}

async function renderResult(camera, detector) {
    try {
        const poses = await detector.estimatePoses(
            camera.video,
            {
                maxPoses: modelConfig.maxPoses,
                flipHorizontal: false
            }
        )
        camera.drawCtx()
        if (poses && poses.length > 0) {
            camera.drawResults(poses)
        }
    } catch (error) {
        // detector.dispose()
        detector = null
        console.log(error)
        // alert(error)
    }
}

async function renderPrediction(camera, detector) {
    await renderResult(camera, detector)
    requestAnimationFrame(() => {
        renderPrediction(camera, detector)
    })
}

export const main = async (video: HTMLVideoElement, canvas: HTMLCanvasElement,
        canvasWrapper: HTMLDivElement, scatterGlContainer: HTMLDivElement,
        vrm: HTMLDivElement
    ) => {
    const cameraOptions = { targetFPS: 60, sizeOption: '640 X 480' }
    const myVrm = await MyVRM.setup(vrm)
    const camera = await Camera.setupCamera(cameraOptions, video, canvas, canvasWrapper, scatterGlContainer, myVrm)
    const detector = await createDetector()
    renderPrediction(camera, detector)
}