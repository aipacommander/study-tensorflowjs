import * as posedetection from '@tensorflow-models/pose-detection';

export const modelConfig = {
    maxPoses: 1,
    type: 'lite',
    scoreThreshold: 0.65,
    render3D: true
}

export const DEFAULT_LINE_WIDTH = 2;
export const DEFAULT_RADIUS = 4;
export const model = posedetection.SupportedModels.BlazePose;