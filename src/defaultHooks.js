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

function ScriptHook(node){
  return {
    beforeNext: function(getCallback){
      if (node.async || node.defer) {
        return;
      }

      attach(node, getCallback());
    }
  };
}

function LinkHook(node){
  return {
    beforeNext: function(getCallback){
      attach(node, getCallback());
    }
  };
}

ScriptHook.initialHook = LinkHook.initialHook = false;

hook('script[src]', ScriptHook);
hook('link[rel=stylesheet][href]', LinkHook);
