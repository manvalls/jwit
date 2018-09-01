import apply from './apply';

function witApply(delta, nodes, rootNode){
  rootNode = rootNode || document.documentElement;
  nodes = nodes || [rootNode];

  return cb => {
    var delayedDelta;
    cb = cb || function(){};

    delayedDelta = apply(delta, rootNode, nodes, function(){
      witApply(delayedDelta, rootNode)(cb);
    });

    if (!delayedDelta) {
      setTimeout(cb, 0);
    }
  };
}

export default witApply;
