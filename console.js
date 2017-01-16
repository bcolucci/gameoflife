
import colors from 'colors'
import { identity } from 'ramda'
import config from './config.json'
import * as core from '.'

const printCase = ({ state }) => {
  const caseConf = config.cases[state]
  return colors[caseConf.color](caseConf.char)
}

const printMap = ({ width, height, cases }) => {
  const printRow = row => console.log('', [ '', ...row.map(c => cases.find(core.compareCase(c))).map(printCase), '' ].join(config.caseSeparator))
  core.fetchMap({ width, height, onOuterIter: identity, onInnerIter: identity, onRow: printRow })
}

const printState = ({ generation, map }) => {
  console.log('\x1Bc')
  console.log(' Generation:', generation)
  printMap(map)
}

let state = core.createInitialState({ width: config.width, height: config.height, alivePct: config.alivePct })
printState(state)

setInterval(() => {
  printState(state)
  state = core.computeNextState(state)
}, config.computeInterval)
