import { DIRECTION } from '@/core/game/types'

export class Paddle {
	width: number = 18
	height: number = 70
	x: number
	y: number
	score: number = 0
	move: number = DIRECTION.IDLE
	speed: number = 10
	constructor(side: string, canvas: any) {
		this.x = side === 'left' ? 150 : canvas.width - 150
		this.y = (canvas.height / 2) - 35
	}
}