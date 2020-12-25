
export function setAttribute(node, key, value) {
  node.setAttribute(key, value)
  if (key == 'value' && node.tagName.toLowerCase() == 'input') {
    node.value = value
  }
}

export function forEach(elems, operation) {
  return new Promise(resolve => {
    let i = -1

    function step() {
      i++
      if (i < elems.length) {
        operation(elems[i]).then(step, step)
      } else {
        resolve()
      }
    }

    step()
  })
}

function clone(elems) {
  const result = []
  for (let i = 0;i < elems.length;i++) {
    result.push(elems[i])
  }

  return result
}

export function getFragment(node, html) {
  const fragment = node.cloneNode()
  fragment.innerHTML = html
  markSingularNodes(fragment)
  return fragment
}

export function mapScript(node) {
  const isAttr = node.getAttribute('is')
  const document = node.ownerDocument

  let script
  if (isAttr) {
    script = document.createElement('script', { is: isAttr })
  } else {
    script = document.createElement('script')
  }

  script.text = node.text
  for (let i = 0; i < node.attributes.length; i++) {
    const attribute = node.attributes[i]
    script.setAttribute(attribute.name, attribute.value)
  }

  return script
}

function onLoad(node) {
  return new Promise(resolve => {
    if (!('onload' in node)) {
      resolve()
      return
    }

    if (node.addEventListener) {
      node.addEventListener('load', resolve, false)
      node.addEventListener('error', resolve, false)
      return
    }

    if (node.attachEvent) {
      node.attachEvent('onload', resolve)
      node.attachEvent('onerror', resolve)
      node.attachEvent('onreadystatechange', () => {
        if (node.readyState == 'loaded' || node.readyState == 'complete') {
          resolve()
        }
      })

      return
    }

    resolve()
  })
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

function waitUntilScriptLoaded(node) {
  if (node.src) {
    return onLoad(node)
  }

  return Promise.resolve()
}

function waitUntilLinkLoaded(node) {
  if (node.href && node.rel == 'stylesheet') {
    return onLoad(node)
  }

  return Promise.resolve()
}

export function transfer(trf, parent) {
  return forEach(clone(parent.childNodes), (node) => {
    if (!node.__witSingularNode) {
      trf(node)
      return Promise.resolve()
    }

    switch (node.tagName.toLowerCase()) {
      case 'script':
        const script = mapScript(node)
        trf(script)
        return waitUntilScriptLoaded(script)
      case 'link':
        trf(node)
        return waitUntilLinkLoaded(node)
      default:
        const clone = node.cloneNode()
        trf(clone)
        return transfer(child => clone.appendChild(child), node)
    }
  })
}
