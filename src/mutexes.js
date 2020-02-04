import RWMutex from './RWMutex'

function getOrCreateMutex(mutexName) {
  if (!window[mutexName]) {
    window[mutexName] = RWMutex()
  }

  return window[mutexName]
}

export const processMutex =  getOrCreateMutex('witProcessMutex')
export const queueMutex =    getOrCreateMutex('witQueueMutex')

let unlocker

function init() {
  if (window.removeEventListener) {
    window.removeEventListener('load', init, false)
    document.removeEventListener('DOMContentLoaded', init, false)
  } else if (window.detachEvent) {
    window.detachEvent('onload', init)
  }

  unlocker()
}

let inited = false
function initQueue() {
  if (inited) {
    return
  }

  inited = true

  if (document.readyState == 'complete' || document.readyState == 'interactive') {
    unlocker()
  } else if (window.addEventListener) {
    window.addEventListener('load', init, false)
    document.addEventListener('DOMContentLoaded', init, false)
  } else if (window.attachEvent) {
    window.attachEvent('onload', init)
  }
}

unlocker = queueMutex.lock((u) => {
  unlocker = u
  initQueue()
})

if (unlocker) {
  initQueue()
}
