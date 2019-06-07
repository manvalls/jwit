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
} from './utils'

import callbackGroup from '../callbackGroup'
import schedule from '../schedule'

import { fromClass, toClass } from '../class'
import { processAttrChange, getHooksToRun, mapNode, runHooks, destroyAllControllersBelow, destroyNode } from '../hook'

function setAttribute(node, key, value){
  node.setAttribute(key, value)
  if (key == 'value' && node.tagName.toLowerCase() == 'input') {
    node.value = value
  }
}

function applyAll(parentDelta, startIndex, rootNode, nodes, cb) {
  let i = startIndex

  function step(){
    if (i < parentDelta.length) {
      apply(parentDelta[i], rootNode, nodes, () => {
        i++
        step()
      })
    } else {
      schedule(cb)
    }
  }

  step()
}

function transfer(trf, parent, cb){
  function transferFirst() {
    const firstChild = parent.childNodes[0]
    if (!firstChild) {
      schedule(cb)
    }

    parent.removeChild(firstChild)
    const hooks = getHooksToRun(firstChild)
    const clone = mapNode(firstChild.cloneNode(), hooks)

    trf(clone)
    runHooks(clone, hooks, () => {
      transfer(node => clone.appendChild(node), firstChild, transferFirst)
    })
  }

  transferFirst()
}

function apply(delta, rootNode, nodes, cb) {
  schedule(() => {
    var i,j,n,a,m,at,f,fc
    const cg = callbackGroup(cb)

    function fireAttrChange(){
      for(const node of nodes){
        processAttrChange(node, cg())
      }
    }

    switch(delta[0]) {

      case sliceType:
        return applyAll(delta, 1, rootNode, nodes, cg())
  
      case rootType:
        return applyAll(delta, 1, rootNode, [rootNode], cg())
  
      case selectorType:
        return applyAll(delta, 2, rootNode, mapNodes(nodes, mapQuerySelector(delta[1])), cg())
  
      case selectorAllType:
        return applyAll(delta, 2, rootNode, mapNodes(nodes, mapQuerySelectorAll(delta[1])), cg())
  
      case parentType:
        return applyAll(delta, 1, rootNode, mapNodes(nodes, mapParent), cg())
  
      case firstChildType:
        return applyAll(delta, 1, rootNode, mapNodes(nodes, mapFirstChild), cg())
  
      case lastChildType:
        return applyAll(delta, 1, rootNode, mapNodes(nodes, mapLastChild), cg())
  
      case prevSiblingType:
        return applyAll(delta, 1, rootNode, mapNodes(nodes, mapPrevSibling), cg())
  
      case nextSiblingType:
        return applyAll(delta, 1, rootNode, mapNodes(nodes, mapNextSibling), cg())

      case htmlType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          n.innerHTML = ''

          f = n.cloneNode()
          f.innerHTML = delta[1]
          transfer(node => n.appendChild(node), f, cg())
        }
  
        break
  
      case replaceType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          const parent = n.parentNode
          if (!parent) {
            continue
          }
          
          f = parent.cloneNode()
          f.innerHTML = delta[1]

          const ref = n.nextSibling

          const cb = cg()
          destroyNode(n, () => {
            parent.removeChild(n)
            transfer(node => parent.insertBefore(node, ref), f, cb)
          })
        }
  
        break
  
      case appendType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]

          f = n.cloneNode()
          f.innerHTML = delta[1]
          transfer(node => n.appendChild(node), f, cg())
        }
  
        break
  
      case prependType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          fc = n.firstChild

          f = n.cloneNode()
          f.innerHTML = delta[1]
          transfer(node => n.insertBefore(node, fc), f, cg())
        }
  
        break
  
      case insertAfterType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          if (!n.parentNode) {
            continue
          }
  
          f = n.parentNode.cloneNode()
          f.innerHTML = delta[1]
          transfer(node => n.parentNode.insertBefore(node, n.nextSibling), f, cg())
        }
  
        break
  
      case insertBeforeType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          if (!n.parentNode) {
            continue
          }
  
          f = n.parentNode.cloneNode()
          f.innerHTML = delta[1]
          transfer(node => n.parentNode.insertBefore(node, n), f, cg())
        }
  
        break
  
      case removeType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          if (n.parentNode) {
            const cb = cg()
            destroyNode(n, () => {
              n.parentNode.removeChild(n)
              cb()
            })
          }
        }
  
        break
  
      case clearType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          const cb = cg()
          destroyAllControllersBelow(n, () => {
            n.innerHTML = ''
            cb()
          })
        }
  
        break

      case addAttrType:
        a = delta[1]
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          for(j in a) if(a.hasOwnProperty(j)) {
            setAttribute(n, j, a[j])
          }
        }
        
        fireAttrChange()
        break
  
      case setAttrType:
        a = delta[1]
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
  
          for(j = n.attributes.length-1;j >= 0;j--){
            at = n.attributes[j].name
            if (!a.hasOwnProperty(at)) {
              n.removeAttribute(at)
            }
          }
  
          for(j in a) if(a.hasOwnProperty(j)) {
            setAttribute(n, j, a[j])
          }
        }
  
        fireAttrChange()
        break
  
      case rmAttrType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          for(j = 1;j < delta.length;j++){
            n.removeAttribute(delta[j])
          }
        }
  
        fireAttrChange()
        break
  
      case addStylesType:
        a = delta[1]
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
  
          for(j in a) if(a.hasOwnProperty(j)) {
            m = a[j].match(/^(.*?)(\s*)!important$/)
            if (m) {
              n.style.setProperty(j, m[1], 'important')
            } else {
              n.style.setProperty(j, a[j])
            }
          }
        }
  
        fireAttrChange()
        break
  
      case rmStylesType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          for(j = 1;j < delta.length;j++){
            n.style.removeProperty(delta[j])
          }
        }
  
        fireAttrChange()
        break
  
      case addClassType:
        a = fromClass(delta[1])
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          m = fromClass(n.className)
  
          for(j in a) if(a.hasOwnProperty(j)) {
            m[j] = true
          }
  
          n.className = toClass(m)
        }
  
        fireAttrChange()
        break
  
      case rmClassType:
        a = fromClass(delta[1])
        for(i = 0;i < nodes.length;i++){
          n = nodes[i]
          m = fromClass(n.className)
  
          for(j in a) if(a.hasOwnProperty(j)) {
            delete m[j]
          }
  
          n.className = toClass(m)
        }
  
        fireAttrChange()
        break

    }
  })
}

export default apply