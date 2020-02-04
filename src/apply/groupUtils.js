import safeRun from './safeRun'

export function mapNodes(nodes, mapFn) {
  var result = []
  var children, i, j, c

  for (i = 0;i < nodes.length;i++) {
    children = mapFn(nodes[i])
    for (j = 0;j < children.length;j++) {
      c = children[j]
      if (c && c.nodeType == 1) {
        result.push(c)
      }
    }
  }

  return result
}

export function mapQuerySelector(selector) {
  return node => safeRun(() => [node.querySelector(selector)]) || []
}

export function mapQuerySelectorAll(selector) {
  return node => safeRun(() => node.querySelectorAll(selector)) || []
}

export function mapParent(node) {
  return [node.parentNode]
}

export function mapFirstChild(node) {
  var i, n, cn = node.childNodes

  for (i = 0;i < cn.length;i++) {
    n = cn[i]
    if (n.nodeType==1) {
      return [n]
    }
  }

  return []
}

export function mapLastChild(node) {
  var i, n, cn = node.childNodes

  for (i = cn.length - 1;i >= 0;i--) {
    n = cn[i]
    if (n.nodeType==1) {
      return [n]
    }
  }

  return []
}

export function mapPrevSibling(node) {
  var ps = node.previousSibling
  while (ps && ps.nodeType !== 1) ps = ps.previousSibling
  return ps ? [ps] : []
}

export function mapNextSibling(node) {
  var ns = node.nextSibling
  while (ns && ns.nodeType !== 1) ns = ns.nextSibling
  return ns ? [ns] : []
}
