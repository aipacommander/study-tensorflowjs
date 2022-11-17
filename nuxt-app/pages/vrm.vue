<template>
    <h1>デモ</h1>
</template>

<script setup lang="ts">
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRMLoaderPlugin, VRMHumanBoneName } from '@pixiv/three-vrm'
import { onMounted } from 'vue'

// レンダラーの設定
onMounted(async () => {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    document.body.appendChild(renderer.domElement)

    // カメラの設定
    const camera = new THREE.PerspectiveCamera(
        35,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    )
    camera.position.set(0, 1.1, 3)

    // カメラコントーロールの設定
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.target.set(0, 0.85, 0)
    controls.screenSpacePanning = true
    controls.update()

    // シーンの設定
    const scene = new THREE.Scene()

    // ライトの設定
    const light = new THREE.DirectionalLight(0xffffff)
    light.position.set(1, 1, 1).normalize()
    scene.add(light)

    // グリッドを表示
    const gridHelper = new THREE.GridHelper(10, 10)
    scene.add(gridHelper)
    gridHelper.visible = true

    // 座標軸を表示
    const axesHelper = new THREE.AxesHelper(0.5)
    scene.add(axesHelper)

    tick()
    function tick() {
        requestAnimationFrame(tick)
        // レンダリング
        renderer.render(scene, camera)
    }

    // モデルをロード
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
    const vrm = gltf.userData.vrm
    scene.add(vrm.scene)
    vrm.scene.rotation.y = Math.PI
    console.log(vrm.humanoid.getPose())

    // animate
    const clock = new THREE.Clock()
    function animate() {
        requestAnimationFrame(animate)
        const deltaTime = clock.getDelta()
        if (vrm) {
            // tweak bones
            const s = 0.25 * Math.PI * Math.sin(Math.PI * clock.elapsedTime);
            vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.Neck).rotation.y = s
            vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.LeftUpperArm).rotation.z = s
            vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName.RightUpperArm).rotation.x = s

            // update vrm
            vrm.update(deltaTime)
        }
        renderer.render(scene, camera)
    }
    animate()
})
</script>