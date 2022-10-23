import { DIRECTION } from '@/core/game/types'

export class Ball {
	width: number = 18
	height: number = 18
	x: number
	y: number
	moveX: number = DIRECTION.IDLE
	moveY: number = DIRECTION.IDLE
	speed: number
	constructor(incrementedSpeed: number, canvas: any) {
		this.x = (canvas.width / 2) - 9,
		this.y = (canvas.height / 2) - 9,
		this.speed = incrementedSpeed || 9
	}
}