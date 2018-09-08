import { hook } from './hook';

function attach(node, callback) {
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

hook('script[src]', class {

  static initialHook = false;

  constructor(node){
    this.node = node;
  }

  beforeNext(getCallback){
    const { node } = this;

    if (node.async || node.defer) {
      return;
    }

    attach(node, getCallback());
  }

});

hook('link[rel=stylesheet][href]', class {

  static initialHook = false;

  constructor(node){
    this.node = node;
  }

  beforeNext(getCallback){
    attach(this.node, getCallback());
  }

});
