import {
  sliceType,
  rootType, selectorType, selectorAllType, parentType,
  firstChildType, lastChildType, prevSiblingType, nextSiblingType,
  removeType, clearType,
  htmlType, replaceType, appendType,
  prependType, insertAfterType, insertBeforeType,
  setAttrType, replaceAttrType, rmAttrType,
  setStylesType, rmStylesType, addClassesType,
  rmClassesType,
} from '../types'

import {
  mapNodes, mapQuerySelector, mapQuerySelectorAll, mapParent,
  mapFirstChild, mapLastChild, mapPrevSibling, mapNextSibling,
} from './groupUtils'

import { fromClass, toClass } from './class'
import { setAttribute, forEach, getFragment, transfer } from './utils'

function apply(delta, rootNode, nodes) {

  switch (delta[0]) {

    case sliceType:
      return forEach(delta.slice(1), d => apply(d, rootNode, nodes))

    case rootType:
      return forEach(delta.slice(1), d => apply(d, rootNode, [rootNode]))

    case selectorType:
      return forEach(delta.slice(2), d => apply(d, rootNode, mapNodes(nodes, mapQuerySelector(delta[1]))))

    case selectorAllType:
      return forEach(delta.slice(2), d => apply(d, rootNode, mapNodes(nodes, mapQuerySelectorAll(delta[1]))))

    case parentType:
      return forEach(delta.slice(1), d => apply(d, rootNode, mapNodes(nodes, mapParent)))

    case firstChildType:
      return forEach(delta.slice(1), d => apply(d, rootNode, mapNodes(nodes, mapFirstChild)))

    case lastChildType:
      return forEach(delta.slice(1), d => apply(d, rootNode, mapNodes(nodes, mapLastChild)))

    case prevSiblingType:
      return forEach(delta.slice(1), d => apply(d, rootNode, mapNodes(nodes, mapPrevSibling)))

    case nextSiblingType:
      return forEach(delta.slice(1), d => apply(d, rootNode, mapNodes(nodes, mapNextSibling)))

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

    case setAttrType: {
      const attrMap = delta[1]
      for (let i = 0;i < nodes.length;i++) {
        const node = nodes[i]
        for (let j in attrMap) if (attrMap.hasOwnProperty(j)) {
          setAttribute(node, j, attrMap[j])
        }
      }

      break
    }

    case replaceAttrType: {
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

    case setStylesType: {
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

    case addClassesType: {
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

    case rmClassesType: {
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
      return forEach(nodes, (node) => {
        node.innerHTML = ''
        return transfer(child => node.appendChild(child), getFragment(node, delta[1]))
      })

    case replaceType:
      return forEach(nodes, (node) => {
        const parent = node.parentNode
        if (!parent) {
          return Promise.resolve()
        }

        const ref = node.nextSibling
        parent.removeChild(node)

        return transfer(child => parent.insertBefore(child, ref), getFragment(parent, delta[1]))
      })

    case appendType:
      return forEach(nodes, (node) => {
        return transfer(child => node.appendChild(child), getFragment(node, delta[1]))
      })

    case prependType:
      return forEach(nodes, (node) => {
        const firstChild = node.firstChild
        return transfer(child => node.insertBefore(child, firstChild), getFragment(node, delta[1]))
      })

    case insertAfterType:
      return forEach(nodes, (node) => {
        if (!node.parentNode) {
          return Promise.resolve()
        }

        return transfer(child => node.parentNode.insertBefore(child, node.nextSibling), getFragment(node.parentNode, delta[1]))
      })

    case insertBeforeType:
      return forEach(nodes, (node) => {
        if (!node.parentNode) {
          return Promise.resolve()
        }

        return transfer(child => node.parentNode.insertBefore(child, node), getFragment(node.parentNode, delta[1]))
      })

  }

  return Promise.resolve()
}

export default apply
