import empty from './empty'
import queue from './queue'
import callbackGroup from './callbackGroup'
import safeRun from './safeRun'
import schedule from './schedule'
import values from './values'

let nextId = 0

const hooks = {}
const elementHooks = {}
const attributeHooks = {}

function toArray(array) {
  if (array && array instanceof Array) {
    return array
  }

  return []
}

function addToMap(list, map, Controller) {
  for (const elem of toArray(list)) {
    map[elem] = map[elem] || {}
    map[elem][Controller.__witHookId] = Controller
  }
}

function removeFromMap(list, map, Controller) {
  for (const elem of toArray(list)) {
    if(map[elem]) {
      delete map[elem][Controller.__witHookId]
      if (empty(map[elem])) {
        delete map[elem]
      }
    }
  }
}

function addHooks(cmap, hooksToRun) {
  if (cmap) {
    for (const key of cmap) if (cmap.hasOwnProperty(key)) {
      hooksToRun[key] = cmap[key]
    }
  }
}

export function hook(Controller, cb){
  if (hooks[Controller.__witHookId]) {
    return
  }

  if (typeof Controller.shouldHook == 'function' && !safeRun(() => Controller.shouldHook())) {
    return
  }

  if (!Controller.__witHookId) {
    Controller.__witHookId = nextId.toString(36)
    nextId = (nextId + 1) % 1e15
  }

  hooks[Controller.__witHookId] = Controller
  addToMap(Controller.elements, elementHooks, Controller)
  addToMap(Controller.attributes, attributeHooks, Controller)

  if (Controller.init !== false) {
    queue(qcb => {
      const cg = callbackGroup(() => {
        safeRun(cb)
        qcb()
      })

      const matchingElements = document.querySelectorAll([
        ...(Controller.elements || []),
        ...(Controller.attributes || []).map(attr => `[${attr}]`)
      ].join(', '))

      for (const elem of matchingElements) {
        runHooks(elem, [Controller], cg())
      }
    })
  } else {
    schedule(cb)
  }
}

export function unhook(Controller) {
  delete hooks[Controller.__witHookId]
  removeFromMap(Controller.elements, elementHooks, Controller)
  removeFromMap(Controller.attributes, attributeHooks, Controller)
}

export function getHooksToRun(element) {
  const hooksToRun = {}

  addHooks(elementHooks[element.tagName.toLowerCase()], hooksToRun)
  for (const attr of element.attributes) {
    addHooks(attributeHooks[attr.name], hooksToRun)
  }

  return values(hooksToRun).sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

export function mapNode(element, hooks) {
  for (const Controller of hooks) {
    if (typeof Controller.mapNode == 'function') {
      safeRun(() => {
        element = Controller.mapNode(element)
      })
    }
  }

  return element
}

export function runHooks(node, hooks, cb) {
  const blockingCallback = callbackGroup(cb)
  
  for (const Controller of hooks) {
    const id = Controller.__witHookId

    safeRun(() => {
      const ctrl = new Controller({
        node,
        blockingCallback,
      })

      const prevAttr = node.getAttribute('wit-ctrl')

      if (prevAttr) {
        node.setAttribute('wit-ctrl', prevAttr + ' ' + id)
        node.__witControllers[id] = [ctrl, Controller]
      } else {
        node.setAttribute('wit-ctrl', id)
        node.__witControllers = {[id]: [ctrl, Controller]}
      }
    })
  }
}

function destroyControllerInternal(node, Controller, cb) {
  const id = Controller.__witHookId
  if (!(node.__witControllers && node.__witControllers[id])) {
    schedule(cb)
    return
  }

  const [ctrl] = node.__witControllers[id]
  const newAttr = node.getAttribute('wit-ctrl').replace(new RegExp(`(^| )${id}($| )`, 'g'), ' ').replace(/(^\s*)|(\s*$)/g, '')

  if (newAttr) {
    node.setAttribute('wit-ctrl', newAttr)
    delete node.__witControllers[id]
  } else {
    node.removeAttribute('wit-ctrl')
    delete node.__witControllers
  }

  if (typeof ctrl.onDestroy == 'function') {
    schedule(() => {
      ctrl.onDestroy({ blockingCallback: callbackGroup(cb) })
    })
  } else {
    schedule(cb)
  }
}

export function destroyController(node, Controller, cb) {
  schedule(() => {
    destroyControllerInternal(node, Controller, cb)
  })
}

export function destroyControllerAbove(element, Controller, cb) {
  while(element = element.parentNode) {
    const ctrl = getController(element, Controller)
    if (ctrl) {
      destroyController(element, Controller, cb)
      return
    }
  }
}

export function destroyControllersAbove(element, Controller, cb) {
  schedule(() => {
    const cg = callbackGroup(cb)

    while(element = element.parentNode) {
      const ctrl = getController(element, Controller)
      if (ctrl) {
        destroyController(element, Controller, cg())
      }
    }
  })
}

export function destroyControllerBelow(node, Controller, cb) {
  const foundNode = node.querySelector(`[wit-ctrl~=${Controller.__witHookId}]`)
  destroyController(foundNode, Controller, cb)
}

export function destroyControllersBelow(node, Controller, cb) {
  schedule(() => {
    const cg = callbackGroup(cb)
    const foundNodes = node.querySelectorAll(`[wit-ctrl~=${Controller.__witHookId}]`)

    for (const node of foundNodes) {
      destroyControllerInternal(node, Controller, cg())
    }
  })
}

export function destroyAllControllers(element, cb) {
  schedule(() => {
    const cg = callbackGroup(cb)

    for (const [, Controller] of values(element.__witControllers || {})) {
      destroyControllerInternal(element, Controller, cg())
    }
  })
}

export function destroyAllControllersBelow(element, cb) {
  schedule(() => {
    const cg = callbackGroup(cb)
    const foundNodes = element.querySelectorAll('[wit-ctrl]')

    for (const node of foundNodes) {
      destroyAllControllers(node, cg())
    }
  })
}

export function destroyNode(element, cb) {
  const cg = callbackGroup(cb)
  destroyAllControllers(element, cg())
  destroyAllControllersBelow(element, cg())
}

export function processAttrChange(element, cb) {
  schedule(() => {
    const cg = callbackGroup(cb)
    const tagName = element.tagName.toLowerCase()

    const attrs = {}
    for (const attr of element.attributes) {
      attrs[attr.name] = true
    }
    
    for (const [ctrl, Controller] of values(element.__witControllers || {})) {
      if (typeof ctrl.onAttrChange == 'function') {
        schedule(() => {
          ctrl.onAttrChange({ blockingCallback: cg })
        })
      }

      if (toArray(Controller.elements).indexOf(tagName) != -1) {
        continue
      }

      for (const attr of toArray(Controller.attributes)) {
        if (attrs[attr]) {
          continue
        }
      }

      destroyControllerInternal(element, Controller, cg())
    }
  })
}

export function getController(element, Controller) {
  return ((element && element.__witControllers) || {})[Controller.__witHookId]
}

export function getControllerAbove(element, Controller) {
  while(element = element.parentNode) {
    const ctrl = getController(element, Controller)
    if (ctrl) {
      return ctrl
    }
  }
}

export function getControllerBelow(element, Controller) {
  const foundNode = element.querySelector(`[wit-ctrl~=${Controller.__witHookId}]`)
  return getController(foundNode, Controller)
}

export function getControllersAbove(element, Controller) {
  const controllers = []

  while(element = element.parentNode) {
    const ctrl = getController(element, Controller)
    if (ctrl) {
      controllers.push(ctrl)
    }
  }

  return controllers
}

export function getControllersBelow(element, Controller) {
  const foundNodes = element.querySelectorAll(`[wit-ctrl~=${Controller.__witHookId}]`)
  const controllers = []

  for (const node of foundNodes) {
    controllers.push(getController(node, Controller))
  }

  return controllers
}

export function getAllControllers(element) {
  return values(element.__witControllers || {}).map(([ctrl]) => ctrl)
}

export function getAllControllersAbove(element) {
  const controllers = []

  while(element = element.parentNode) {
    controllers = controllers.concat(getAllControllers(element))
  }

  return controllers
}

export function getAllControllersBelow(element) {
  const foundNodes = element.querySelectorAll('[wit-ctrl]')
  const controllers = []

  for(const node of foundNodes) {
    controllers = controllers.concat(getAllControllers(node))
  }

  return controllers
}