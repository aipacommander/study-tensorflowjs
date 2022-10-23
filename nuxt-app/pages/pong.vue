<template>
    <canvas id="canvas"></canvas>
</template>

<style>
    body {
        text-align: center;
    }
</style>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Game } from '@/core/game/game'

onMounted(() => {
	const canvas = document.querySelector('#canvas')
	const game = new Game(canvas);
})

</script>