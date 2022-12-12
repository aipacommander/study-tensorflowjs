import * as tf from '@tensorflow/tfjs'
import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm'
import { CLASSES } from './labels'
import { registerBackend } from '@tensorflow/tfjs-core';
import { BackendWasm, init } from '@tensorflow/tfjs-backend-wasm/dist/backend_wasm'

// registerBackend('wasm', async () => {
//     const { wasm } = await init();
//     return new BackendWasm(wasm);
// }, 2)

console.log(tfjsWasm.version_wasm)
tfjsWasm.setWasmPaths(
    `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-wasm@${tfjsWasm.version_wasm}/dist/`)


export const loadModel = async () => {
    // バックエンドの読み込みを待つ
    tf.setBackend('wasm')
    await tf.ready()
    // モデルのロードを待つ
    const modelPath = "https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1"
    console.log(tf.getBackend())
    return await tf.loadGraphModel(modelPath, { fromTFHub: true })
}

export const setupWebcam = async (videoRef, detectionRef) => {
    const video = videoRef.value
    const canvas = detectionRef.value
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // カメラからデータを取得する準備
        const webcamStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: 'user', // フロントカメラ
            },
        });

        // <video>で表示できるようにする
        video.srcObject = webcamStream
        return new Promise((resolve, _) => {
            // <video>にデータが流れたら発火
            video.onloadedmetadata = () => {
                // <canvas>に流す
                const ctx = canvas.getContext('2d')
                const imgWidth = video.clientWidth
                const imgHeight = video.clientHeight
                canvas.width = imgWidth
                canvas.height = imgHeight
                ctx.font = '16px sans-serif'
                ctx.textBaseline = 'top'
                resolve([ctx, imgHeight, imgWidth])
            }
        })
    } else {
        alert("No webcam - sorry!");
    }
}

export const doStuff = async (video, canvas, mode) => {
    try {
        const model = await loadModel()
        const cameraDetails = await setupWebcam(video, canvas)
        if (mode === 'filter') {
            performDetections(model, video, cameraDetails)
        } else {
            detections(model, video, cameraDetails)
        }
    } catch (e) {
        console.error(e)
    }
}

export const detections = async(model, videoRef, cameraDetails) => {
    const video = videoRef.value
    const [ctx, imgHeight, imgWidth] = cameraDetails
    // Tensor画像に変換
    const myTensor = tf.browser.fromPixels(video)
    // モデルの入力次元は [1, 縦サイズ, 横サイズ, RGB]
    // なので、3D(1枚の画像)を4Dにする
    const readyfied = tf.expandDims(myTensor, 0)
    // モデルに入力!!
    const results = await model.executeAsync(readyfied)

    // boxes
    const boxes = await results[1].squeeze().array()
    ctx.width = imgWidth
    ctx.height = imgHeight
    // 前の結果を消す
    ctx.clearRect(0, 0, ctx.width, ctx.height)
    boxes.forEach((box, _) => {
      ctx.strokeStyle = "#0F0"
      ctx.lineWidth = 1
      const startY = box[0] * imgHeight
      const startX = box[1] * imgWidth
      const height = (box[2] - box[0]) * imgHeight
      const width = (box[3] - box[1]) * imgWidth
      ctx.strokeRect(startX, startY, width, height)
    })

    // 無限に回す
    requestAnimationFrame(() => {
        detections(model, videoRef, cameraDetails)
    })
}

export const performDetections = async (model, mysteryRef, camDetails) => {
    const [ctx, imgHeight, imgWidth] = camDetails
    const mystery = mysteryRef.value
    const myTensor = tf.browser.fromPixels(mystery)
    const readyfied = tf.expandDims(myTensor, 0)
    const results = await model.executeAsync(readyfied)

    // Get a clean tensor of top indices
    const detectionThreshold = 0.4
    const iouThreshold = 0.5
    const maxBoxes = 100
    const prominentDetection = tf.topk(results[0])
    // const prominentDetection = results[0]
    const justBoxes = results[1].squeeze()
    const justValues = prominentDetection.values.squeeze()

    // Move results back to JavaScript in parallel
    const [maxIndices, scores, boxes] = await Promise.all([
        prominentDetection.indices.data(),
        justValues.array(),
        justBoxes.array(),
    ]);

    // https://arxiv.org/pdf/1704.04503.pdf, use Async to keep visuals
    const nmsDetections = await tf.image.nonMaxSuppressionWithScoreAsync(
        justBoxes,           // bounding boxes
        justValues,          // 予測確率
        maxBoxes,            // 予測確率が高い順に取得する数
        iouThreshold,        // iouの閾値
        detectionThreshold,  // 予測確率の閾値
        1 // 0 is normal NMS, 1 is Soft-NMS for overlapping support
    )

    const chosen = await nmsDetections.selectedIndices.data();
    // Mega Clean
    tf.dispose([
        results[0],
        results[1],
        nmsDetections.selectedIndices,
        nmsDetections.selectedScores,
        prominentDetection.indices,
        prominentDetection.values,
        myTensor,
        readyfied,
        justBoxes,
        justValues,
    ]);

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    chosen.forEach((detection) => {
        ctx.strokeStyle = "#0F0";
        ctx.lineWidth = 4;
        ctx.globalCompositeOperation = "destination-over";
        const detectedIndex = maxIndices[detection];
        const detectedClass = CLASSES[detectedIndex];
        const detectedScore = scores[detection];
        const dBox = boxes[detection];

        // No negative values for start positions
        const startY = dBox[0] > 0 ? dBox[0] * imgHeight : 0;
        const startX = dBox[1] > 0 ? dBox[1] * imgWidth : 0;
        const height = (dBox[2] - dBox[0]) * imgHeight;
        const width = (dBox[3] - dBox[1]) * imgWidth;
        ctx.strokeRect(startX, startY, width, height);
        // Draw the label background.
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = "#0B0";
        const textHeight = 16;
        const textPad = 4;
        const label = `${detectedClass} ${Math.round(detectedScore * 100)}%`;
        const textWidth = ctx.measureText(label).width;
        ctx.fillRect(startX, startY, textWidth + textPad, textHeight + textPad);
        // Draw the text last to ensure it's on top.
        ctx.fillStyle = "#000000";
        ctx.fillText(label, startX, startY);
    })

    // Loop forever
    requestAnimationFrame(() => {
        performDetections(model, mysteryRef, camDetails)
    });
}