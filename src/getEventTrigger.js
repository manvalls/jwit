import { getAllControllersAbove, getAllControllers } from './hook';
import safeRun from './safeRun';

function getEventTrigger(node, handlerName){
  const controllers = getAllControllers(node).concat(getAllControllersAbove(node));
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

    const event = {
      stopPropagation: () => {
        propagationStopped = true;
      },
    };

    if(pre){
      for(let i = 0;i < pre.length;i++){
        safeRun(() => pre[i](event));
        if(propagationStopped){
          return;
        }
      }
    }

    for(let i = 0;i < capturers.length;i++){
      safeRun(() => capturers[i]['capture' + handlerName](event));
      if(propagationStopped){
        return;
      }
    }

    for(let i = 0;i < handlers.length;i++){
      safeRun(() => handlers[i]['on' + handlerName](event));
      if(propagationStopped){
        return;
      }
    }

    if(post){
      for(let i = 0;i < post.length;i++){
        safeRun(() => post[i](event));
        if(propagationStopped){
          return;
        }
      }
    }
  }
}

export default getEventTrigger;