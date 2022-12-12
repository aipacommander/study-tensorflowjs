import * as posedetection from '@tensorflow-models/pose-detection'
import { ScatterGL } from 'scatter-gl/src/index'
import { modelConfig, DEFAULT_LINE_WIDTH, DEFAULT_RADIUS, model } from './consistans'
import { MyVRM } from './my-vrm'

const VIDEO_SIZE = {
    '640 X 480': { width: 640, height: 480 },
    '640 X 360': { width: 640, height: 360 },
    '360 X 270': { width: 360, height: 270 }
}
const ANCHOR_POINTS = [[0, 0, 0], [0, 1, 0], [-1, 0, 0], [-1, -1, 0]]

export class Camera {
    private video: HTMLVideoElement
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private scatterGLEl: HTMLDivElement
    private scatterGL: ScatterGL
    private scatterGLHasInitialized: boolean
    private myVrm: MyVRM

    constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement, scatterGLEl: HTMLDivElement, myVrm: MyVRM) {
        this.video = video
        this.canvas = canvas
        this.ctx = this.canvas.getContext('2d')
        this.scatterGLEl = scatterGLEl
        this.scatterGL = new ScatterGL(this.scatterGLEl, {
            'rotateOnStart': true,
            'selectEnabled': false,
            'styles': { polyline: { defaultOpacity: 1, deselectedOpacity: 1 } }
        })
        this.scatterGLHasInitialized = false
        this.myVrm = myVrm
    }

    static async setupCamera(cameraParam: any, video: HTMLVideoElement, canvas: HTMLCanvasElement, canvasContainer: HTMLDivElement, scatterGlContainer: HTMLDivElement, myVrm: MyVRM) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error(
                'Browser API navigator.mediaDevices.getUserMedia not available'
            )
        }

        const { targetFPS } = cameraParam
        const videoConfig = {
            'audio': false,
            'video': {
                width: { ideal: VIDEO_SIZE['360 X 270'].width },
                height: { ideal: VIDEO_SIZE['360 X 270'].height },
                frameRate: { ideal: targetFPS }
            }
        }
        const camera = new Camera(video, canvas, scatterGlContainer, myVrm)
        camera.video.srcObject = await navigator.mediaDevices.getUserMedia(videoConfig)
        camera.video.play()
        camera.video.style.display = 'none'

        const videoWidth = videoConfig.video.width.ideal
        const videoHeight = videoConfig.video.height.ideal
        camera.video.width = videoWidth
        camera.video.height = videoHeight

        camera.canvas.width = videoWidth
        camera.canvas.height = videoHeight
        canvasContainer.style.width = `${videoWidth}px`
        canvasContainer.style.height = `${videoHeight}px`

        camera.ctx.translate(camera.canvas.width, 0)
        camera.ctx.scale(-1, 1)

        // camera.scatterGLEl.style.width = `${videoWidth}px`
        // camera.scatterGLEl.style.height = `${videoHeight}px`
        // camera.scatterGL.resize()
        // camera.scatterGLEl.style.display = 'inline-block'

        return camera
    }

    drawCtx() {
        this.ctx.drawImage(
            this.video,
            0,
            0,
            this.video.videoWidth,
            this.video.videoHeight
        )
    }

    clearCtx() {
        this.ctx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight)
    }

    /**
     * Draw the keypoints and skeleton on the video.
     * @param poses A list of poses to render.
     */
    drawResults(poses) {
        for (const pose of poses) {
            this.drawResult(pose)
        }
    }

    /**
     * Draw the keypoints and skeleton on the video.
     * @param pose A pose with keypoints to render.
     */
    drawResult(pose) {
        if (pose.keypoints != null) {
            this.drawKeypoints(pose.keypoints)
            this.drawSkeleton(pose.keypoints)
        }
        if (pose.keypoints3D != null && modelConfig.render3D) {
            // this.drawKeypoints3D(pose.keypoints3D)
            this.myVrm.update(pose.keypoints, pose.keypoints3D)
        }
    }

    /**
     * Draw the keypoints on the video.
     * @param keypoints A list of keypoints.
     */
    drawKeypoints(keypoints) {
        const keypointInd =
            posedetection.util.getKeypointIndexBySide(model);
        this.ctx.fillStyle = 'Red';
        this.ctx.strokeStyle = 'White';
        this.ctx.lineWidth = DEFAULT_LINE_WIDTH;

        for (const i of keypointInd.middle) {
            this.drawKeypoint(keypoints[i]);
        }

        this.ctx.fillStyle = 'Green';
        for (const i of keypointInd.left) {
            this.drawKeypoint(keypoints[i]);
        }

        this.ctx.fillStyle = 'Orange';
        for (const i of keypointInd.right) {
            this.drawKeypoint(keypoints[i]);
        }
    }

    drawKeypoint(keypoint) {
        // If score is null, just show the keypoint.
        const score = keypoint.score != null ? keypoint.score : 1
        const scoreThreshold = modelConfig.scoreThreshold || 0

        if (score >= scoreThreshold) {
            const circle = new Path2D()
            circle.arc(keypoint.x, keypoint.y, DEFAULT_RADIUS, 0, 2 * Math.PI)
            this.ctx.fill(circle)
            this.ctx.stroke(circle)
        }
    }

    /**
     * Draw the skeleton of a body on the video.
     * @param keypoints A list of keypoints.
     */
    drawSkeleton(keypoints) {
        this.ctx.fillStyle = 'White';
        this.ctx.strokeStyle = 'White';
        this.ctx.lineWidth = DEFAULT_LINE_WIDTH;

        posedetection.util.getAdjacentPairs(model).forEach(([
            i, j
        ]) => {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];

            // If score is null, just show the keypoint.
            const score1 = kp1.score != null ? kp1.score : 1;
            const score2 = kp2.score != null ? kp2.score : 1;
            const scoreThreshold = modelConfig.scoreThreshold || 0;

            if (score1 >= scoreThreshold && score2 >= scoreThreshold) {
                this.ctx.beginPath();
                this.ctx.moveTo(kp1.x, kp1.y);
                this.ctx.lineTo(kp2.x, kp2.y);
                this.ctx.stroke();
            }
        });
    }

    drawKeypoints3D(keypoints) {
        const scoreThreshold = modelConfig.scoreThreshold || 0;
        const pointsData =
            keypoints.map(keypoint => ([-keypoint.x, -keypoint.y, -keypoint.z]));

        const dataset =
            new ScatterGL.Dataset([...pointsData, ...ANCHOR_POINTS]);

        const keypointInd =
            posedetection.util.getKeypointIndexBySide(model);
        this.scatterGL.setPointColorer((i) => {
            if (keypoints[i] == null || keypoints[i].score < scoreThreshold) {
                // hide anchor points and low-confident points.
                return '#ffffff'
            }
            if (i === 0) {
                return '#ff0000' /* Red */
            }
            if (keypointInd.left.indexOf(i) > -1) {
                return '#00ff00' /* Green */
            }
            if (keypointInd.right.indexOf(i) > -1) {
                return '#ffa500' /* Orange */
            }
        });

        if (!this.scatterGLHasInitialized) {
            this.scatterGL.render(dataset)
        } else {
            this.scatterGL.updateDataset(dataset)
        }
        const connections = posedetection.util.getAdjacentPairs(model)
        // const sequences = connections.map(pair => ({ indices: pair }))
        // this.scatterGL.setSequences(sequences)
        this.scatterGLHasInitialized = true
    }
}