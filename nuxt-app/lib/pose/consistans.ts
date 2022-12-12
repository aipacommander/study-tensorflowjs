import * as posedetection from '@tensorflow-models/pose-detection'

export const modelConfig = {
    maxPoses: 1,
    type: 'lite',
    scoreThreshold: 0.65,
    render3D: true
}

export const DEFAULT_LINE_WIDTH = 2;
export const DEFAULT_RADIUS = 4;
export const model = posedetection.SupportedModels.BlazePose

// https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/readme.md#blazepose-keypoints-used-in-mediapipe-blazepose
export const KEYPOINTS_BLASE_POSE = {
    'nose': 0,
    'left_eye_inner': 1,
    'left_eye': 2,
    'left_eye_outer': 3,
    'right_eye_inner': 4,
    'right_eye': 5,
    'right_eye_outer': 6,
    'left_ear': 7,
    'right_ear': 8,
    'mouth_left': 9,
    'mouth_right': 10,
    'left_shoulder': 11,
    'right_shoulder': 12,
    'left_elbow': 13,
    'right_elbow': 14,
    'left_wrist': 15,
    'right_wrist': 16,
    'left_pinky': 17,
    'right_pinky': 18,
    'left_index': 19,
    'right_index': 20,
    'left_thumb': 21,
    'right_thumb': 22,
    'left_hip': 23,
    'right_hip': 24,
    'left_knee': 25,
    'right_knee': 26,
    'left_ankle': 27,
    'right_ankle': 28,
    'left_heel': 29,
    'right_heel': 30,
    'left_foot_index': 31,
    'right_foot_index': 32,
    'bodycenter': 33,
    'forehead': 34,
    'leftthumb': 35,
    'lefthand': 36,
    'rightthumb': 37,
    'righthand': 38,
}