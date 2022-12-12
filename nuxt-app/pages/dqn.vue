<template>
    <canvas id="canvas" ref="canvas"></canvas>
</template>

<style>
    body {
        text-align: center;
    }
</style>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Game } from '@/core/game/game'
import { train } from '../lib/dqn/train'
import { Agent } from '../lib/dqn/agent'
import { DQN } from '../lib/dqn/dqn'

const canvas = ref<HTMLCanvasElement>()
onMounted(() => {
	const game = new Game(canvas.value)
    const dqn = new DQN()
    const agent = new Agent(dqn, game, {
        epsilonInit: 0.5,
        epsilonFinal: 1e3,
        epsilonDecayFrames: 1e5,
        learningRate: 1e-3,
        replayBufferSize: 1e4,
    })
    train(agent, 128, 1e-2, 1e-4, 10, 100, 1)
})

</script>