import apply from './apply'
import safeRun from './safeRun'
import { processMutex, queueMutex } from '../mutexes'

function queuedApply(delta, ...args) {
  let rootNode, cb, nodes

  for (const arg of args) {
    if (typeof arg == 'function') {
      cb = arg
    } else if (arg instanceof Array) {
      nodes = arg
    } else {
      rootNode = arg
    }
  }

  rootNode = rootNode || document.documentElement
  nodes = nodes || [rootNode]

  if (!cb) {
    return new Promise((resolve) => {
      const done = queuedApply(delta, nodes, rootNode, resolve)
      if (done) {
        resolve()
      }
    })
  }

  let unlockQueueMutex
  let unlockProcessMutex
  let isAsync = false

  function waitPending(cb) {
    unlockProcessMutex()
    unlockProcessMutex = processMutex.lock((unlock) => {
      unlockProcessMutex = unlock
      cb()
    })

    return !unlockProcessMutex
  }

  function runApply() {
    const isApplyAsync = apply(delta, rootNode, nodes, waitPending, () => {
      unlockProcessMutex()
      unlockQueueMutex()
      safeRun(() => cb(true))
    })

    isAsync = isApplyAsync || isAsync

    if (!isApplyAsync) {
      unlockProcessMutex()
      unlockQueueMutex()

      if (isAsync) {
        safeRun(() => cb(true))
      }
    }
  }

  function acquireProcessMutex() {
    unlockProcessMutex = processMutex.lock((unlock) => {
      unlockProcessMutex = unlock
      runApply()
    })

    if (unlockProcessMutex) {
      runApply()
    } else {
      isAsync = true
    }
  }

  unlockQueueMutex = queueMutex.lock((unlock) => {
    unlockQueueMutex = unlock
    acquireProcessMutex()
  })

  if (unlockQueueMutex) {
    acquireProcessMutex()
  } else {
    isAsync = true
  }

  if (!isAsync) {
    return true
  }
}

export default queuedApply
