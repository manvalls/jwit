import apply from './apply'
import mutex from '../mutex'

export default (delta, ...args) => {
  let rootNode, nodes

  for (const arg of args) {
    if (arg instanceof Array) {
      nodes = arg
    } else {
      rootNode = arg
    }
  }

  rootNode = rootNode || document.documentElement
  nodes = nodes || [rootNode]
  return mutex.lock().then(unlock => {
    return apply(delta, rootNode, nodes).then(unlock, unlock)
  })
}
