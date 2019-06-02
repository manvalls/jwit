import apply from './apply';
import queue from '../queue';
import safeRun from '../safeRun';

function queuedApply(delta, ...args){
  let rootNode, cb, nodes

  for (const arg of args) {
    if (typeof arg == 'function') {
      cb = arg
    } else if(arg instanceof Array) {
      nodes = arg
    } else {
      rootNode = arg
    }
  }

  rootNode = rootNode || document.documentElement;
  nodes = nodes || [rootNode];

  queue(qcb => {
    apply(delta, rootNode, nodes, function(){
      safeRun(cb);
      qcb();
    });
  });
}

export default queuedApply;
