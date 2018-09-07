import { removeType, clearType } from '../types';
import { destroy } from '../hook';

function applyDestructors(delta, rootNode, nodes, cb){
  var i,n;

  switch(delta[0]) {

    case removeType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        if (n.parentNode) {
          destroy(n, true);
          n.parentNode.removeChild(n);
        }
      }

      return;

    case clearType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        destroy(n);
        n.innerHTML = '';
      }

      return;

  }

}

export default applyDestructors;
