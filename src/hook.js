import safeRun from './safeRun';
import queue from './queue';
import getCallbackFactory from './getCallbackFactory';

const hooks = {};
let nextId = 0;

export function hook(selector, Controller){
  const id = nextId++;
  let aborted = false;

  if (typeof selector == 'function') {
    Controller = selector;
    selector = Controller.selector;
  }

  const unqueue = queue(cb => {
    if (aborted) {
      return cb();
    }

    hooks[id] = [selector, Controller];
    if (Controller.initialHook === false) {
      return cb();
    }

    const arr = getCallbackFactory(cb);
    const getCallback = arr[0];
    const waiting = arr[1];

    const h = {};
    h[id] = hooks[id];

    getHooksRunner(document, h)(getCallback);
    if (!waiting()) {
      cb();
    }
  });

  return () => {
    if (aborted) {
      return;
    }
    
    aborted = true;
    delete hooks[id];
    unqueue();
    unqueue = null;
  };
}

function parentLevels(node){
  let n = 0;
  while(node = node.parentNode) n++;
  return n;
}

export function getHooksRunner(container, h){
  const hooksToRun = [];
  h = h || hooks;

  for(let id in h) if(h.hasOwnProperty(id)){
    safeRun(() => {
      const arr = h[id];
      const selector = arr[0];
      const Controller = arr[1];

      const nodes = container.querySelectorAll(selector);
      for(let i = 0;i < nodes.length;i++){
        hooksToRun.push([nodes[i], parentLevels(nodes[i]), Controller]);
      }
    });
  }

  hooksToRun.sort((a, b) => a[1] - b[1]).sort((a, b) => (b[2].priority || 0) - (a[2].priority || 0));

  return (getCallback) => {
    for(let i = 0;i < hooksToRun.length;i++) {
      const arr = hooksToRun[i];
      const node = arr[0];
      const Controller = arr[2];
      
      safeRun(() => {
        attach(node, new Controller(node, getCallback));
      });
    }
  };
}

export function attach(node, ctrl){
  var ctrls;

  if (!node) {
    return;
  }

  node.setAttribute('wit-controlled', '');
  ctrls = node.__witControllers = node.__witControllers || [];
  if (ctrls.indexOf(ctrl) == -1) {
    node.__witControllers.push(ctrl);
  }
}

export function detach(node, ctrl) {
  var ctrls = (node && node.__witControllers) || [];
  var i = ctrls.indexOf(ctrl);
  if (i != -1) {
    ctrls.splice(i, 1);
  }
}

export function getControllers(node){
  if (node && node.hasAttribute('wit-controlled')) {
    return (node.__witControllers || []).slice();
  }

  return [];
}

export function getControllersBellow(node){
  var controllers = [];
  var nodes, i;

  if (!node) {
    return controllers;
  }

  nodes = node.querySelectorAll('[wit-controlled]');

  for (i = 0;i < nodes.length;i++) {
    controllers = controllers.concat(getControllers(nodes[i]));
  }

  return controllers;
}

export function getControllersAbove(node) {
  var parent = node && node.parentElement;
  var controllers = [];

  while(parent) {
    controllers = controllers.concat(getControllers(parent));
    parent = parent.parentElement;
  }

  return controllers;
}
