import { hook } from './hook';
import wrapFactory from './wrapFactory';

function attach(node, callback) {
  if (('onload' in node) && node.addEventListener) {
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

function ScriptHook(node, getCallback){
  if (node.async || node.defer) {
    return;
  }

  attach(node, getCallback());
}

function LinkHook(node, getCallback){
  attach(node, getCallback());
}

ScriptHook.initialHook = LinkHook.initialHook = false;

export const hookScripts = wrapFactory(() => [
  hook('script[src]', ScriptHook),
]);

export const hookStyleSheets = wrapFactory(() => [
  hook('link[rel=stylesheet][href]', LinkHook),
])

export const hookAssets = wrapFactory(() => [
  hookScripts(),
  hookStyleSheets(),
])

