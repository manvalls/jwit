import queue from './queue';
import getCallbackFactory from './getCallbackFactory';
import safeRun from './safeRun';

const attr = 'wit-' + Math.random().toString(36).slice(-3) + Date.now().toString(36).slice(-4)
const hooks = {};
let nextId = 0;

function parentLevels(node){
  let n = 0;
  while(node = node.parentNode) n++;
  return n;
}

export function hook(selector, Controller){
  const id = (nextId++).toString(36);
  let aborted = false;

  if (typeof selector == 'function') {
    Controller = selector;
    selector = Controller.selector;
  }

  const unqueue = queue(cb => {
    if (aborted) {
      return cb();
    }

    hooks[id] = { selector, Controller };

    const arr = getCallbackFactory(cb);
    const getCallback = arr[0];
    const waiting = arr[1];

    checkHooksInternal(document, getCallback, {[id]: hooks[id]});
    if (!waiting()) {
      cb();
    }
  });

  return {
    clear: () => {
      if (aborted) {
        return;
      }
      
      aborted = true;
      delete hooks[id];
      unqueue();
      unqueue = null;
    },
  }
}

function sortHooks(hooks){
  hooks.sort((a, b) => a.parents - b.parents).sort((a, b) => (b.Controller.priority || 0) - (a.Controller.priority || 0));
}

function checkHooksInternal(container, getCallback, hooks){
  const toHook = [];
  const toDestroy = [];

  for(let id in hooks) if(hooks.hasOwnProperty(id)){
    const { selector, Controller } = hooks[id];

    const nodes = container.querySelectorAll(selector);
    for(let i = 0;i < nodes.length;i++){
      nodes[i].__witHookFound = true;
    }

    const previousNodes = container.querySelectorAll(`[${attr}~=${id}]`);
    for(let i = 0;i < previousNodes.length;i++){
      if(previousNodes[i].__witHookFound){
        delete previousNodes[i].__witHookFound;
      }else{
        toDestroy.push({
          node: previousNodes[i],
          parents: parentLevels(previousNodes[i]),
          Controller,
          id,
        })
      }
    }

    for(let i = 0;i < nodes.length;i++) if(nodes[i].__witHookFound){
      delete nodes[i].__witHookFound;
      toHook.push({
        node: nodes[i],
        parents: parentLevels(nodes[i]),
        Controller,
        id,
      });
    }
  }

  sortHooks(toHook);
  sortHooks(toDestroy).reverse();

  for(let i = 0;i < toDestroy.length;i++){
    const { id, node } = toDestroy[i];
    const ctrl = node.__witControllers[id];

    if (typeof ctrl.destroy == 'function') safeRun(() => {
      ctrl.destroy(getCallback);
    });

    const newAttr = node.getAttribute(attr).replace(new RegExp(`(^| )${id}($| )`, 'g'), ' ').replace(/(^\s*)|(\s*$)/g, '');
    if (newAttr) {
      node.setAttribute(attr, newAttr);
      delete node.__witControllers[id];
    } else {
      node.removeAttribute(attr);
      delete node.__witControllers;
    }
  }

  for(let i = 0;i < toHook.length;i++){
    const { id, node, Controller } = toHook[i];

    safeRun(() => {
      const ctrl = new Controller(node, getCallback);
      const prevAttr = node.getAttribute(attr);

      if (prevAttr) {
        node.setAttribute(attr, prevAttr + ' ' + id);
        node.__witControllers[id] = ctrl;
      } else {
        node.setAttribute(attr, id);
        node.__witControllers = {[id]: ctrl};
      }
    });
  }
}

// TODO:
// - getControllers
// - getControllersBellow
// - getControllersAbove
// - destroyChildren
// - destroy
// - wrapFactory -> combineHooks
// - h.getParent
// - h.getChild
// - h.getLocal
// - h.getParents
// - h.getChildren
// - h.getLocals

// For internal usage
export function checkHooks(container, getCallback){
  checkHooksInternal(container, getCallback, hooks)
}

// For external usage
export function checkChildren(container){
  return fcb => {
    fcb = fcb || (() => {});
    queue(qcb => {
      const cb = () => {
        safeRun(fcb);
        qcb();
      };

      const arr = getCallbackFactory(cb);
      const getCallback = arr[0];
      const waiting = arr[1];
  
      checkHooksInternal(container, getCallback, hooks);
      if (!waiting()) {
        cb();
      }
    });
  };
}