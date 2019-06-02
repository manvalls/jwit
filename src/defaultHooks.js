function attach(node, callback) {
  if (!('onload' in node)) {
    callback()
    return
  }

  if (node.addEventListener) {
    node.addEventListener('load', callback, false);
    node.addEventListener('error', callback, false);
  } else if (node.attachEvent) {
    node.attachEvent('onload', callback);
    node.attachEvent('onerror', callback);
    node.attachEvent('onreadystatechange', () => {
      if(node.readyState == 'loaded' || node.readyState == 'complete'){
        callback();
      }
    });
  } else {
    callback();
  }
}

export class ScriptHook {
  static init = false
  static elements = ['script']

  static mapNode(n) {
    const s = document.createElement('script');
    s.text = n.text;
    for (const a of n.attributes) {
      s.setAttribute(a.name, a.value);
    }

    return s
  }

  constructor({ node, blockingCallback }){
    if (node.src) {
      attach(node, blockingCallback())
    }
  }
}

export class LinkHook {
  static init = false
  static elements = ['link']

  constructor({ node, blockingCallback }){
    if (node.href && node.rel == 'stylesheet') {
      attach(node, blockingCallback())
    }
  }
}


