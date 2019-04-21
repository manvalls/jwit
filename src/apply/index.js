import apply from './apply';
import queue from '../queue';
import safeRun from '../safeRun';
import { tick } from '../events';

function queuedApply(delta, nodes, rootNode){
  return cb => {
    queue(qcb => {
      rootNode = rootNode || document.documentElement;
      nodes = nodes || [rootNode];

      apply(delta, rootNode, nodes, function(){
        tick.trigger(nodes, rootNode);
        safeRun(cb);
        qcb();
      });
    });
  };
}

export default queuedApply;
