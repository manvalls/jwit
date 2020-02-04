import {
  sliceType,
  rootType, selectorType, selectorAllType, parentType,
  firstChildType, lastChildType, prevSiblingType, nextSiblingType,
  removeType, clearType,
  htmlType, replaceType, appendType,
  prependType, insertAfterType, insertBeforeType,
  addAttrType, setAttrType, rmAttrType,
  addStylesType, rmStylesType, addClassType,
  rmClassType,
} from '../types'

import {
  mapNodes, mapQuerySelector, mapQuerySelectorAll, mapParent,
  mapFirstChild, mapLastChild, mapPrevSibling, mapNextSibling,
} from './groupUtils'

import { fromClass, toClass } from './class'

function setAttribute(node, key, value) {
  node.setAttribute(key, value)
  if (key == 'value' && node.tagName.toLowerCase() == 'input') {
    node.value = value
  }
}

function forEach(elems, operation, cb) {
  let i = 0
  let isAsync = false

  function step() {
    while (i < elems.length) {
      const wasOperationAsync = operation(elems[i], () => {
        i++
        step()
      })

      isAsync = isAsync || wasOperationAsync

      if (wasOperationAsync) {
        return
      }

      i++
    }

    if (isAsync) {
      cb()
    }
  }

  step()
  return isAsync
}

function applyAll(parentDelta, startIndex, rootNode, nodes, waitPending, cb) {
  return forEach(parentDelta.slice(startIndex), (delta, innerCb) => {
    return apply(delta, rootNode, nodes, waitPending, innerCb)
  }, cb)
}

function clone(elems) {
  const result = []
  for (let i = 0;i < elems.length;i++) {
    result.push(elems[i])
  }

  return result
}

function getFragment(node, html) {
  const fragment = node.cloneNode()
  fragment.innerHTML = html
  markSingularNodes(fragment)
  return fragment
}

function mapScript(node) {
  const script = document.createElement('script')
  script.text = node.text
  for (let i = 0; i < node.attributes.length; i++) {
    const attribute = node.attributes[i]
    script.setAttribute(attribute.name, attribute.value)
  }

  return script
}

function onLoad(node, callback) {
  if (!('onload' in node)) {
    return false
  }

  if (node.addEventListener) {
    node.addEventListener('load', callback, false)
    node.addEventListener('error', callback, false)
    return true
  }

  if (node.attachEvent) {
    node.attachEvent('onload', callback)
    node.attachEvent('onerror', callback)
    node.attachEvent('onreadystatechange', () => {
      if (node.readyState == 'loaded' || node.readyState == 'complete') {
        callback()
      }
    })

    return true
  }

  return false
}

function waitUntilScriptLoaded(node, cb) {
  if (node.src) {
    return onLoad(node, cb)
  }

  return false
}

function waitUntilLinkLoaded(node, cb) {
  if (node.href && node.rel == 'stylesheet') {
    return onLoad(node, cb)
  }

  return false
}

function doAsync(wrapper, cb, handler) {
  const isAsync = wrapper(() => {
    const isAsync = handler(cb)
    if (!isAsync) {
      cb()
    }
  })

  if (!isAsync) {
    return handler(cb)
  }

  return true
}

function transfer(trf, parent, waitPending, cb) {
  return forEach(clone(parent.childNodes), (node, callback) => {
    if (!node.__witSingularNode) {
      trf(node)
      return false
    }

    let ran = false
    const cb = () => {
      if (ran) {
        return
      }

      ran = true
      callback()
    }

    switch (node.tagName.toLowerCase()) {
      case 'script':
        const script = mapScript(node)
        trf(script)

        return doAsync(cb => waitUntilScriptLoaded(script, cb), cb, cb => {
          return waitPending(cb)
        })
      case 'link':
        trf(node)
        return waitUntilLinkLoaded(node, cb)
      default:
        const clone = node.cloneNode()
        trf(clone)
        return transfer(child => clone.appendChild(child), node, waitPending, cb)
    }
  }, cb)
}

function markSingularNodes(fragment) {
  const singularNodes = fragment.querySelectorAll('script, link[rel=stylesheet]')

  for (let i = 0;i < singularNodes.length;i++) {
    let node = singularNodes[i]

    while (node) {
      node.__witSingularNode = true
      node = node.parentNode
    }
  }
}

function apply(delta, rootNode, nodes, waitPending, cb) {

  switch (delta[0]) {

    case sliceType:
      return applyAll(delta, 1, rootNode, nodes, waitPending, cb)

    case rootType:
      return applyAll(delta, 1, rootNode, [rootNode], waitPending, cb)

    case selectorType:
      return applyAll(delta, 2, rootNode, mapNodes(nodes, mapQuerySelector(delta[1])), waitPending, cb)

    case selectorAllType:
      return applyAll(delta, 2, rootNode, mapNodes(nodes, mapQuerySelectorAll(delta[1])), waitPending, cb)

    case parentType:
      return applyAll(delta, 1, rootNode, mapNodes(nodes, mapParent), waitPending, cb)

    case firstChildType:
      return applyAll(delta, 1, rootNode, mapNodes(nodes, mapFirstChild), waitPending, cb)

    case lastChildType:
      return applyAll(delta, 1, rootNode, mapNodes(nodes, mapLastChild), waitPending, cb)

    case prevSiblingType:
      return applyAll(delta, 1, rootNode, mapNodes(nodes, mapPrevSibling), waitPending, cb)

    case nextSiblingType:
      return applyAll(delta, 1, rootNode, mapNodes(nodes, mapNextSibling), waitPending, cb)

    case removeType: {
      for (let i = 0;i < nodes.length;i++) {
        const node = nodes[i]
        if (node.parentNode) {
          node.parentNode.removeChild(node)
        }
      }

      break
    }

    case clearType: {
      for (let i = 0;i < nodes.length;i++) {
        nodes[i].innerHTML = ''
      }

      break
    }

    case addAttrType: {
      const attrMap = delta[1]
      for (let i = 0;i < nodes.length;i++) {
        const node = nodes[i]
        for (let j in attrMap) if (attrMap.hasOwnProperty(j)) {
          setAttribute(node, j, attrMap[j])
        }
      }

      break
    }

    case setAttrType: {
      const attrMap = delta[1]
      for (let i = 0;i < nodes.length;i++) {
        const node = nodes[i]

        for (let j = node.attributes.length-1;j >= 0;j--) {
          const name = node.attributes[j].name
          if (!attrMap.hasOwnProperty(name)) {
            node.removeAttribute(name)
          }
        }

        for (let j in attrMap) if (attrMap.hasOwnProperty(j)) {
          setAttribute(node, j, attrMap[j])
        }
      }

      break
    }

    case rmAttrType: {
      for (let i = 0;i < nodes.length;i++) {
        const node = nodes[i]
        for (let j = 1;j < delta.length;j++) {
          node.removeAttribute(delta[j])
        }
      }

      break
    }

    case addStylesType: {
      const stylesMap = delta[1]
      for (let i = 0;i < nodes.length;i++) {
        const node = nodes[i]

        for (let j in stylesMap) if (stylesMap.hasOwnProperty(j)) {
          const m = stylesMap[j].match(/^(.*?)(\s*)!important$/)
          if (m) {
            node.style.setProperty(j, m[1], 'important')
          } else {
            node.style.setProperty(j, stylesMap[j])
          }
        }
      }

      break
    }

    case rmStylesType: {
      for (let i = 0;i < nodes.length;i++) {
        const node = nodes[i]
        for (let j = 1;j < delta.length;j++) {
          node.style.removeProperty(delta[j])
        }
      }

      break
    }

    case addClassType: {
      const stylesMap = fromClass(delta[1])
      for (let i = 0;i < nodes.length;i++) {
        const node = nodes[i]
        const classMap = fromClass(node.className)

        for (let j in stylesMap) if (stylesMap.hasOwnProperty(j)) {
          classMap[j] = true
        }

        node.className = toClass(classMap)
      }

      break
    }

    case rmClassType: {
      const classMap = fromClass(delta[1])
      for (let i = 0;i < nodes.length;i++) {
        let node = nodes[i]
        const nodeClassMap = fromClass(node.className)

        for (let j in classMap) if (classMap.hasOwnProperty(j)) {
          delete nodeClassMap[j]
        }

        node.className = toClass(nodeClassMap)
      }

      break
    }

    case htmlType:
      return forEach(nodes, (node, innerCb) => {
        node.innerHTML = ''
        return transfer(child => node.appendChild(child), getFragment(node, delta[1]), waitPending, innerCb)
      }, cb)

    case replaceType:
      return forEach(nodes, (node, innerCb) => {
        const parent = node.parentNode
        if (!parent) {
          return false
        }

        const ref = node.nextSibling
        parent.removeChild(node)

        return transfer(child => parent.insertBefore(child, ref), getFragment(parent, delta[1]), waitPending, innerCb)
      }, cb)

    case appendType:
      return forEach(nodes, (node, innerCb) => {
        return transfer(child => node.appendChild(child), getFragment(node, delta[1]), waitPending, innerCb)
      }, cb)

    case prependType:
      return forEach(nodes, (node, innerCb) => {
        const firstChild = node.firstChild
        return transfer(child => node.insertBefore(child, firstChild), getFragment(node, delta[1]), waitPending, innerCb)
      }, cb)

    case insertAfterType:
      return forEach(nodes, (node, innerCb) => {
        if (!node.parentNode) {
          return false
        }

        return transfer(child => node.parentNode.insertBefore(child, node.nextSibling), getFragment(node.parentNode, delta[1]), waitPending, innerCb)
      }, cb)

    case insertBeforeType:
      return forEach(nodes, (node, innerCb) => {
        if (!node.parentNode) {
          return false
        }

        return transfer(child => node.parentNode.insertBefore(child, node), getFragment(node.parentNode, delta[1]), waitPending, innerCb)
      }, cb)

  }

  return waitPending(cb)
}

export default apply
