// @ts-nocheck
import _ from 'lodash'

export default function generateRandomLevel() {
  const goals = []
  // Skew towards 3-goal levels, with potential for as many as 7
  const goalCount = _.random(_.random(2, 3), _.random(3, 7))

  // Generate goals at random locations
  for (let i = 0; i < goalCount; i++) {
    let x = 0
    let y = 0

    const type = Math.random() < 1 / (goalCount + 1) ? 'dynamic' : 'fixed'

    do {
      x = _.random(-16, 16)
      y = _.random(-12, 12)
    } while (
      _.find(goals, (v) => {
        const d = Math.sqrt(Math.pow(x - v.x, 2) + Math.pow(y - v.y, 2))

        if (type == 'dynamic' && v.type == 'dynamic') {
          if (Math.abs(v.x - x) < 1.5) return true
        } else if (type == 'dynamic' || v.type == 'dynamic') {
          if (Math.abs(v.x - x) < 1.5) return true
        } else {
          if (d <= 1.9) return true
        }
      })
    )

    goals.push({
      x,
      y,
      type,
    })
  }

  // Apply ordering to goals
  {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

    const ordered =
      Math.random() < 0.5 ||
      _.filter(goals, (v) => v.type == 'dynamic').length > 1
    const orderCount = !ordered ? 0 : Math.max(2, _.random(0, goalCount))

    let i = 0
    let a = [...goals]
    while (i < orderCount) {
      i++

      a = _.shuffle(a)
      const v = a.pop()

      if (alphabet[0] == 'A' && i == orderCount) v.order = 'B'
      else if (Math.random() < 0.5) v.order = alphabet[0]
      else v.order = alphabet.shift()
    }
  }

  // Guarantee that there is never more than one unordered dynamic goal
  {
    let unorderedDynamicGoals = 0
    for (const goal of goals) {
      if (goal.type == 'dynamic') {
        if (unorderedDynamicGoals > 0) goal.type = 'fixed'
        unorderedDynamicGoals++
      }
    }
  }

  const sledderCount = goalCount > 2 && Math.random() < 0.5 ? _.random(1, 2) : 1
  const sledders = []
  const sledderAssets = [
    'images.ada_sled',
    'images.jack_sled',
    'images.ada_jack_sled',
  ]

  for (let i = 0; i < sledderCount; i++) {
    let sledderX = 0

    do {
      sledderX = _.random(-16, 16)
    } while (
      _.find(goals, (v) => Math.abs(v.x - sledderX) < 1.5) ||
      _.find(sledders, (v) => Math.abs(v.x - sledderX) < 3.5)
    )

    sledders.push({
      x: sledderX,
      asset: sledderCount == 1 ? _.sample(sledderAssets) : sledderAssets[i],
    })
  }

  const biome = _.sample([
    'westernSlopes',
    'valleyParabola',
    'eternalCanyon',
    'sinusoidalDesert',
    'logisticDunes',
    'hilbertDelta',
  ])

  return {
    name: 'Random Level',
    nick: 'RANDOM',
    drawOrder: 10000, //LAYERS.level,
    x: -10,
    y: 0,
    defaultExpression: '0',
    goals,
    sledders,
    biome,
  }
}
