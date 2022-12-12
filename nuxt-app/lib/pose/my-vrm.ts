import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM, VRMHumanBoneName, VRMLoaderPlugin } from '@pixiv/three-vrm'
import { KEYPOINTS_BLASE_POSE } from './consistans'
import { Pose } from './kalidokit'

export class MyVRM {
    renderer: THREE.WebGLRenderer
    camera: THREE.PerspectiveCamera
    controls: OrbitControls
    scene: THREE.Scene
    light: THREE.DirectionalLight
    vrm: VRM
    clock: THREE.Clock
    constructor() {
        this.clock = new THREE.Clock()
    }

    getAngleFromX(pos2, pos1) {
        return Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x)
    }

    transformKeypoints(keypoints) {
        const transformedKeypoints = {}
        keypoints.forEach(keypoint => {
            if (keypoint.score <= 0.3) return
            transformedKeypoints[keypoint.name] = {
                x: 360 / 2 - keypoint.x,
                y: 270 / 2 - keypoint.y,
                z: keypoint.z,
            }
        })
        return transformedKeypoints
    }

    update(keypoints, keypoints3d) {
        const a = Pose.solve(keypoints3d, keypoints, {
            imageSize: {height: 270, width: 360}
        })
        // console.log(a.LeftLowerArm)
        // console.log(a.RightUpperArm)
        // console.log(a.LeftUpperArm)
        // const keypoints = this.transformKeypoints(_keypoints)
        // const xyz = keypoints['left_elbow']
        // this.vrm.humanoid.setRawPose({
        //     leftUpperArm: {
        //         rotation: [ xyz.x, xyz.y, xyz.z, xyz.x ],
        //     }
        // })
        // this.vrm.update(this.clock.getDelta())
        // this.renderer.render(this.scene, this.camera)
    }

    update2(_keypoints) {
        const keypoints = this.transformKeypoints(_keypoints)
        const angleStore = {}
        if (keypoints.left_shoulder && keypoints.right_shoulder) {
            const angle = this.getAngleFromX(keypoints.right_shoulder, keypoints.left_shoulder)
            if (angle !== null) {
                const angle2 = angle * -1 // 回転方向を逆に
                angleStore['Spine'] = angle2
                this.vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Spine).rotation.z = angle2
            }
        }

        if (keypoints.left_eye && keypoints.right_eye) {
            // モデルの首のrotationは背骨から時計回りの角度
            // ポーズの両目をつないだ線分はX軸から反時計回りの角度
            const angle = this.getAngleFromX(keypoints.right_eye, keypoints.left_eye)
            if (angle !== null) {
                const angle2 = angle * -1 // Y軸から時計回りの角度に変換
                angleStore['Neck'] = angle2
                const angle3 = angle2 - (angleStore['Spine'] || 0) // 背骨からの角度に変換
                this.vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Neck).rotation.z = angle3
            }
        }

        if (keypoints.left_shoulder && keypoints.left_elbow) {
            // モデルの右手上腕のrotationは背骨-90°方向から時計回りの角度
            // ポーズの左手上腕はX軸から反時計回りの角度
            const angle = this.getAngleFromX(keypoints.left_elbow, keypoints.left_shoulder)
            if (angle !== null) {
                const angle2 = Math.PI - angle // -X軸から時計回りの角度に変換
                angleStore['RightUpperArm'] = angle2
                const angle3 = angle2 - (angleStore['Spine'] || 0) // 背骨-90°方向のから角度に変換
                this.vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm).rotation.z = angle3
            }
        }

        if (keypoints.left_wrist && keypoints.left_elbow) {
            // モデルの右手前腕のrotationは右手上腕から時計回りの角度
            // ポーズの左手前腕はX軸から反時計回りの角度
            const angle = this.getAngleFromX(keypoints.left_wrist, keypoints.left_elbow)
            if (angle !== null) {
                const angle2 = Math.PI - angle // -X軸から時計回りの角度に変換
                angleStore['RightLowerArm'] = angle2
                const angle3 = angle2 - (angleStore['RightUpperArm'] || 0) // 右手上腕からの角度に変換
                this.vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightLowerArm).rotation.z = angle3
            }
        }

        if (keypoints.right_shoulder && keypoints.right_elbow) {
            // モデルの左手上腕のrotationは背骨+90°方向から時計回りの角度
            // ポーズの右手上腕はX軸から反時計回りの角度
            const angle = this.getAngleFromX(keypoints.right_elbow, keypoints.right_shoulder)
            if (angle !== null) {
                const angle2 = angle * -1 // X軸から時計回りの角度に変換
                angleStore['LeftUpperArm'] = angle2
                const angle3 = angle2 - (angleStore['Spine'] || 0) // 背骨+90°方向からの角度に変換
                this.vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm).rotation.z = angle3
            }
        }

        if (keypoints.right_wrist && keypoints.right_elbow) {
            // モデルの左手前腕のrotationは左手上腕から時計回りの角度
            // ポーズの右手前腕はX軸から反時計回りの角度
            const angle = this.getAngleFromX(keypoints.right_wrist, keypoints.right_elbow)
            if (angle !== null) {
                const angle2 = angle * -1 // X軸から時計回りの角度に変換
                angleStore['LeftLowerArm'] = angle2
                const angle3 = angle2 - (angleStore['LeftUpperArm'] || 0) // 左手上腕からの角度に変換
                this.vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftLowerArm).rotation.z = angle3
            }
        }

        this.vrm.update(this.clock.getDelta())
        this.renderer.render(this.scene, this.camera)
    }

    public static async setup(vrmDiv: HTMLDivElement) {
        const myVrm = new MyVRM()
        myVrm.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })
        myVrm.renderer.setSize(window.innerWidth, window.innerHeight)
        myVrm.renderer.setPixelRatio(window.devicePixelRatio)
        vrmDiv.appendChild(myVrm.renderer.domElement)

        // カメラの設定
        myVrm.camera = new THREE.PerspectiveCamera(
            35,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        )
        myVrm.camera.position.set(0, 1.1, 3)

        // カメラコントーロールの設定
        myVrm.controls = new OrbitControls(myVrm.camera, myVrm.renderer.domElement)
        myVrm.controls.target.set(0, 0.85, 0)
        myVrm.controls.screenSpacePanning = true
        myVrm.controls.update()

        // シーンの設定
        myVrm.scene = new THREE.Scene()

        // ライトの設定
        myVrm.light = new THREE.DirectionalLight(0xffffff)
        myVrm.light.position.set(1, 1, 1).normalize()
        myVrm.scene.add(myVrm.light)

        // グリッドを表示
        const gridHelper = new THREE.GridHelper(10, 10)
        myVrm.scene.add(gridHelper)
        gridHelper.visible = true

        // 座標軸を表示
        const axesHelper = new THREE.AxesHelper(0.5)
        myVrm.scene.add(axesHelper)

        tick()
        function tick() {
            requestAnimationFrame(tick)
            // レンダリング
            myVrm.renderer.render(myVrm.scene, myVrm.camera)
        }

        // モデルをロード
        const loader = new PromiseGLTFLoader()
        loader.register((parser) => {
            return new VRMLoaderPlugin(parser);
        });
        const gltf = await loader.promiseLoad(
            '/models/ultraman.vrm',
            progress => {
                console.log(
                    'Loading model...',
                    100.0 * (progress.loaded / progress.total),
                    '%',
                )
            },
        )
        myVrm.vrm = gltf.userData.vrm
        myVrm.scene.add(myVrm.vrm.scene)
        myVrm.vrm.scene.rotation.y = Math.PI

        return myVrm
    }
}

class PromiseGLTFLoader extends GLTFLoader {
    promiseLoad(
        url: string,
        onProgress?: ((event: ProgressEvent<EventTarget>) => void) | undefined,
    ) {
        return new Promise<GLTF>((resolve, reject) => {
            super.load(url, resolve, onProgress, reject)

        })
    }
}