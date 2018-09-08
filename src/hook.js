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

  queue(cb => {
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
    aborted = true;
    delete hooks[id];
  };
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

      if (nodes.length) {
        hooksToRun.push([id, nodes, selector, Controller]);
      }
    });
  }

  return (getCallback) => {
    for(let i = 0;i < hooksToRun.length;i++) {
      const arr = hooksToRun[i];
      const id = arr[0];
      const nodes = arr[1];
      const selector = arr[2];
      const Controller = arr[3];

      for (let j = 0;j < nodes.length;j++) {
        const node = nodes[j];
        safeRun(() => {
          const ctrl = new Controller(node);

          node.setAttribute('wit-controlled', '');
          node.__witControllers = node.__witControllers || [];
          node.__witControllers.push(ctrl);

          if (typeof ctrl.beforeNext == 'function'){
            safeRun(() => ctrl.beforeNext(getCallback));
          }
        });
      }
    }
  };
}

export function getControllers(node){
  if (node.hasAttribute('wit-controlled')) {
    return (node.__witControllers || []).slice();
  }

  return [];
}

export function getControllersBellow(node){
  var controllers = [];
  var nodes = node.querySelectorAll('wit-controlled');
  var i;

  for (i = 0;i < nodes.length;i++) {
    controllers = controllers.concat(getControllers(nodes[i]));
  }

  return controllers;
}

export function destroy(node, inclusive) {
  var controllers = getControllersBellow(node);
  var i;

  if (inclusive) {
    controllers = controllers.concat(getControllers(node));
  }

  for(i = 0;i < controllers.length;i++){
    let ctrl = controllers[i];
    if (typeof ctrl.destroy == 'function') safeRun(() => ctrl.destroy());
  }
}
