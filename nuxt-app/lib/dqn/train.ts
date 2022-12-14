/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

// The value of tf (TensorFlow.js-Node module) will be set dynamically
// depending on the value of the --gpu flag below.
import * as tf from '@tensorflow/tfjs'
// import { copyWeights } from './dqn'

class MovingAverager {
    buffer: any
    constructor(bufferLength) {
        this.buffer = []
        for (let i = 0; i < bufferLength; ++i) {
            this.buffer.push(null)
        }
    }

    append(x) {
        this.buffer.shift()
        this.buffer.push(x)
    }

    average() {
        return this.buffer.reduce((x, prev) => x + prev) / this.buffer.length
    }
}

/**
 * Train an agent to play the snake game.
 *
 * @param {SnakeGameAgent} agent The agent to train.
 * @param {number} batchSize Batch size for training.
 * @param {number} gamma Reward discount rate. Must be a number >= 0 and <= 1.
 * @param {number} learnigRate
 * @param {number} cumulativeRewardThreshold The threshold of moving-averaged
 *   cumulative reward from a single game. The training stops as soon as this
 *   threshold is achieved.
 * @param {number} maxNumFrames Maximum number of frames to train for.
 * @param {number} syncEveryFrames The frequency at which the weights are copied
 *   from the online DQN of the agent to the target DQN, in number of frames.
 */
export async function train(agent, batchSize, gamma, learningRate, cumulativeRewardThreshold, maxNumFrames, syncEveryFrames) {
    for (let i = 0; i < agent.replayBufferSize; ++i) {
        agent.playStep()
    }

    // Moving averager: cumulative reward across 100 most recent 100 episodes.
    const rewardAverager100 = new MovingAverager(100)
    // Moving averager: fruits eaten across 100 most recent 100 episodes.
    const eatenAverager100 = new MovingAverager(100)

    const optimizer = tf.train.adam(learningRate)
    let tPrev = new Date().getTime()
    let frameCountPrev = agent.frameCount
    let averageReward100Best = -Infinity
    while (true) {
        agent.trainOnReplayBatch(batchSize, gamma, optimizer)
        const { cumulativeReward, done, fruitsEaten } = agent.playStep()
        if (done) {
            const t = new Date().getTime()
            const framesPerSecond = (agent.frameCount - frameCountPrev) / (t - tPrev) * 1e3
            tPrev = t
            frameCountPrev = agent.frameCount

            rewardAverager100.append(cumulativeReward)
            eatenAverager100.append(fruitsEaten)
            const averageReward100 = rewardAverager100.average()
            const averageEaten100 = eatenAverager100.average()

            console.log(
                `Frame #${agent.frameCount}: ` +
                `cumulativeReward100=${averageReward100.toFixed(1)}; ` +
                `eaten100=${averageEaten100.toFixed(2)} ` +
                `(epsilon=${agent.epsilon.toFixed(3)}) ` +
                `(${framesPerSecond.toFixed(1)} frames/s)`);
            if (averageReward100 >= cumulativeRewardThreshold ||
                agent.frameCount >= maxNumFrames) {
                break
            }
            if (averageReward100 > averageReward100Best) {
                averageReward100Best = averageReward100
            }
        }
        if (agent.frameCount % syncEveryFrames === 0) {
            // copyWeights(agent.targetNetwork, agent.onlineNetwork)
            console.log('Sync\'ed weights from online network to target network')
        }
    }
}
