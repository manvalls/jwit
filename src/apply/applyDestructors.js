import { removeType, clearType } from '../types';

function applyDestructors(delta, rootNode, nodes, cb){
  var i,n;

  switch(delta[0]) {

    case removeType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        if (n.parentNode) {
          n.parentNode.removeChild(n);
        }
      }

      return;

    case clearType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        n.innerHTML = '';
      }

      return;

  }
  
}

export default applyDestructors;
