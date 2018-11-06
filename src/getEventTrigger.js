import { getControllersAbove, getControllers } from './hook';
import safeRun from './safeRun';

function getEventTrigger(node, handlerName){
  const controllers = getControllers(node).concat(getControllersAbove(node));
  const capturers = [];
  const handlers = [];

  for(let i = 0;i < controllers.length;i++){
    const ctrl = controllers[i];

    if(typeof ctrl['capture' + handlerName] === 'function'){
      capturers.unshift(ctrl)
    }

    if(typeof ctrl['on' + handlerName] === 'function'){
      handlers.push(ctrl)
    }
  }
  
  return function(pre, post){
    let propagationStopped = false;
    let defaultPrevented = false;

    const event = {
      stopPropagation: () => {
        propagationStopped = true;
      },
      preventDefault: () => {
        defaultPrevented = true;
      },
    };

    if(pre){
      for(let i = 0;i < pre.length;i++){
        safeRun(() => pre[i](event));
        if(propagationStopped){
          return defaultPrevented;
        }
      }
    }

    for(let i = 0;i < capturers.length;i++){
      safeRun(() => capturers[i]['capture' + handlerName](event));
      if(propagationStopped){
        return defaultPrevented;
      }
    }

    for(let i = 0;i < handlers.length;i++){
      safeRun(() => handlers[i]['on' + handlerName](event));
      if(propagationStopped){
        return defaultPrevented;
      }
    }

    if(post){
      for(let i = 0;i < post.length;i++){
        safeRun(() => post[i](event));
        if(propagationStopped){
          return defaultPrevented;
        }
      }
    }

    return defaultPrevented;
  }
}

export default getEventTrigger;