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

let scriptsHooked = false;
export function hookScripts(){
  if (scriptsHooked) {
    return () => {};
  }

  scriptsHooked = true;
  return hook('script[src]', ScriptHook);
}

let styleSheetsHooked = false;
export function hookStyleSheets(){
  if (styleSheetsHooked) {
    return () => {};
  }

  styleSheetsHooked = true;
  return hook('link[rel=stylesheet][href]', LinkHook);
}

export function hookAssets(){
  const scriptUnhook = hookScripts();
  const linkUnhook = hookStyleSheets();
  return () => {
    scriptUnhook();
    linkUnhook();
  };
}

