
export default window.witMutex = window.witMutex || (() => {
  let queued = []
  let locked = true

  const unlockQueue = () => {
    if (queued.length > 0) {
      queued.shift()()
    } else {
      locked = false
    }
  }

  const mutex = {
    lock() {
      return new Promise(resolve => {
        let unlock = () => {
          unlock = () => {}
          unlockQueue()
        }

        if (!locked) {
          locked = true
          resolve(() => unlock())
          return
        }

        queued.push(() => resolve(() => unlock()))
      })
    },
  }

  let cb = () => {
    if (window.removeEventListener) {
      window.removeEventListener('load', cb, false)
      document.removeEventListener('DOMContentLoaded', cb, false)
    } else if (window.detachEvent) {
      window.detachEvent('onload', cb)
    }

    cb = () => {}
    unlockQueue()
  }

  if (document.readyState == 'complete' || document.readyState == 'interactive') {
    unlockQueue()
  } else if (window.addEventListener) {
    window.addEventListener('load', cb, false)
    document.addEventListener('DOMContentLoaded', cb, false)
  } else if (window.attachEvent) {
    window.attachEvent('onload', cb)
  }

  return mutex
})()
