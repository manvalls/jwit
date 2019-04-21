import safeRun from './safeRun';
import queue from './queue';
import callbackGroup from './callbackGroup';

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

    const cg = callbackGroup(cb)

    const h = {};
    h[id] = hooks[id];

    getHooksRunner(document, h)(cg);
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

function destroyInternal(node, inclusive, getCallback) {
  var controllers = getControllersBellow(node);
  var i;

  if (inclusive) {
    controllers = controllers.concat(getControllers(node));
  }

  for(i = 0;i < controllers.length;i++){
    let ctrl = controllers[i];
    if (typeof ctrl.destroy == 'function') safeRun(() => ctrl.destroy(getCallback || (() => () => {})));
  }
}

export function destroyChildren(node, getCallback){
  destroyInternal(node, false, getCallback)
}

export function destroy(node, getCallback){
  destroyInternal(node, true, getCallback)
}

function getFirst(controllers, key){
  for(let i = 0;i < controllers.length;i++){
    if (controllers[i].key === key) {
      return controllers[i];
    } 
  }
}

function getAll(controllers, key){
  const result = [];
  let check;

  if (typeof key == 'function'){
    check = key;
  } else {
    check = ctrl => ctrl.key === key;
  }

  for(let i = 0;i < controllers.length;i++){
    if (check(controllers[i])) {
      result.push(controllers[i]);
    }
  }

  return result;
}

export function getParent(node, key){
  return getFirst(getControllersAbove(node), key)
}

export function getChild(node, key){
  return getFirst(getControllersBellow(node), key)
}

export function getLocal(node, key){
  return getFirst(getControllers(node), key)
}

export function getParents(node, key){
  return getAll(getControllersAbove(node), key)
}

export function getChildren(node, key){
  return getAll(getControllersBellow(node), key)
}

export function getLocals(node, key){
  return getAll(getControllers(node), key)
}