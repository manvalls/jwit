function RWMutex() {
  let listeners = []
  let readers = 0
  let writers = 0

  function decreaseWriters() {
    writers--
    checkListeners()
  }

  function decreaseReaders() {
    readers--
    checkListeners()
  }

  function checkListeners() {
    if (writers === 0 && readers === 0) {
      const oldListeners = listeners
      listeners = []

      for (let i = 0;i < oldListeners.length;i++) {
        oldListeners[i]()
      }
    }
  }

  const mutex = {
    readLock(cb) {
      if (!cb) {
        return new Promise((resolve) => {
          const unlocker = mutex.readLock(resolve)
          if (unlocker) {
            resolve(unlocker)
          }
        })
      }

      let unlock = () => {
        unlock = () => {}
        decreaseReaders()
      }

      if (writers === 0) {
        readers++
        return () => unlock()
      }

      listeners.push(() => {
        readers++
        cb(() => unlock())
      })
    },

    lock(cb) {
      if (!cb) {
        return new Promise((resolve) => {
          const unlocker = mutex.lock(resolve)
          if (unlocker) {
            resolve(unlocker)
          }
        })
      }

      let unlock = () => {
        unlock = () => {}
        decreaseWriters()
      }

      if (writers === 0 && readers === 0) {
        writers++
        return () => unlock()
      }

      listeners.push(() => {
        writers++
        cb(() => unlock())
      })
    },
  }

  return mutex
}

export default RWMutex
