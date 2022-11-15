import * as posedetection from '@tensorflow-models/pose-detection'
import { Camera } from './camera'
import { modelConfig } from './consistans'
import '@tensorflow/tfjs-backend-webgl'
import '@mediapipe/pose'


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

export const main = async (video: HTMLVideoElement, canvas: HTMLCanvasElement, canvasWrapper: HTMLDivElement, scatterGlContainer: HTMLDivElement) => {
    const cameraOptions = { targetFPS: 60, sizeOption: '640 X 480' }
    const camera = await Camera.setupCamera(cameraOptions, video, canvas, canvasWrapper, scatterGlContainer)
    const detector = await createDetector()
    renderPrediction(camera, detector)
}