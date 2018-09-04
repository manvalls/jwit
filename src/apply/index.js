import apply from './apply';
import queue from '../queue';
import safeRun from '../safeRun';
import { tick } from '../events';

function witApply(delta, nodes, rootNode){
  rootNode = rootNode || document.documentElement;
  nodes = nodes || [rootNode];

  return cb => {
    var delayedDelta;
    cb = cb || function(){};

    delayedDelta = apply(delta, rootNode, nodes, function(){
      witApply(delayedDelta, nodes, rootNode)(cb);
    });

    tick.trigger(nodes, rootNode);
    if (!delayedDelta) {
      cb();
    }
  };
}

function queuedApply(delta, nodes, rootNode){
  return cb => {
    queue(qcb => {
      witApply(delta, nodes, rootNode)(() => {
        safeRun(cb);
        qcb();
      });
    });
  };
}

export default queuedApply;
