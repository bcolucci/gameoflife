
import { identity } from 'ramda'
import config from './config.json'

export const STATE = {
  isDead: 'isDead',
  willBorn: 'willBorn',
  isAlive: 'isAlive',
  willSurvive: 'willSurvive',
  willDie: 'willDie'
}

export const fetchMap = ({ width, height, onRow, onOuterIter, onInnerIter }) => {
  let y = 0, x
  const row = []
  for (y; y < height; y += 1) {
    onOuterIter({ y })
    x = 0
    for (x; x < width; x += 1) {
      const c = { x, y }
      row.push(c)
      onInnerIter(c)
    }
    onRow(row.splice(0, row.length))
  }
}

export const createMap = ({ width, height }) => {
  const map = { width, height, cases: [] }
  const pushCase = ({ x, y }) => map.cases.push({ x, y })
  fetchMap({ width, height, onRow: identity, onOuterIter: identity, onInnerIter: pushCase })
  return map
}

export const compareCase = expected => c => c.x === expected.x && c.y === expected.y

export const randomNumber = n => Math.floor(Math.random() * n)

export const getRandomCase = ({ width, height }) => {
  return {
    x: randomNumber(width),
    y: randomNumber(height)
  }
}

export const createRandomAlives = ({ width, height, alivePct }) => {
  const nbAlives = Math.floor((width * height) * alivePct)
  const alives = []
  while (alives.length < nbAlives) {
    const randomCase = getRandomCase({ width, height })
    if (! alives.find(compareCase(randomCase))) {
      alives.push(randomCase)
    }
  }
  return alives
}

export const createInitialState = ({ width, height, alivePct }) => {
  const alives = createRandomAlives({ width, height, alivePct })
  const map = createMap({ width, height })
  return {
    generation: 1,
    intermediate: false,
    map: Object.assign({}, map, {
      cases: map.cases.map(c => {
        const isAlive = alives.find(compareCase(c))
        return Object.assign({}, c, { state: isAlive ? STATE.willBorn : STATE.isDead })
      })
    })
  }
}

export const getNeighbours = ({ x, y }) => {
  return [
    { x: x-1, y: y-1 },
    { x: x, y: y-1 },
    { x: x+1, y: y-1 },
    { x: x+1, y: y },
    { x: x+1, y: y+1 },
    { x: x, y: y+1 },
    { x: x-1, y: y+1 },
    { x: x-1, y: y }
  ]
}

export const computeNextCaseState = ({ nbNeighboursAlive, state }) => {
  switch (state) {
    case STATE.isDead:
      return nbNeighboursAlive === 3 ? STATE.willBorn : STATE.isDead
      break;
    case STATE.willBorn:
      return STATE.isAlive
      break;
    case STATE.isAlive:
      return (nbNeighboursAlive === 2 || nbNeighboursAlive === 3) ? STATE.willSurvive : STATE.willDie
      break;
    case STATE.willSurvive:
      return STATE.isAlive
      break;
    case STATE.willDie:
      return STATE.isDead
      break;
  }
}

export const computeNextMap = ({ intermediate, map }) => {
  return Object.assign({}, map, {
    cases: map.cases.map(c => {
      const nbNeighboursAlive = getNeighbours(c)
        .filter(({ x, y }) => x > -1 && y > -1 && x < map.width && y < map.height)
        .map(c => map.cases.find(compareCase(c)))
        .map(c => c.state)
        .filter(state => state === STATE.isAlive)
        .length
      let nextState = computeNextCaseState({ nbNeighboursAlive, state: c.state })
      return Object.assign({}, c, { state: nextState })
    })
  })
}

export const computeNextState = previousState => {
  return Object.assign({}, previousState, {
    generation: previousState.intermediate ? previousState.generation : (previousState.generation + 1),
    intermediate: ! previousState.intermediate,
    map: computeNextMap(previousState)
  })
}
