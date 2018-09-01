import {
  addAttrType, setAttrType, rmAttrType,
  addStylesType, rmStylesType, addClassType,
  rmClassType,
} from '../types';

import { fromClass, toClass } from '../class'

function applyAttributes(delta, rootNode, nodes, cb){
  var i,j,n,a,m;

  switch(delta[0]) {

    case addAttrType:
      a = delta[1];
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        for(j in a) if(a.hasOwnProperty(j)) {
          n.setAttribute(j, a[j]);
        }
      }

      return;

    case setAttrType:
      a = delta[1];
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];

        for(j = n.attributes.length-1;j >= 0;j--){
          at = n.attributes[j].name;
          if (!a.hasOwnProperty(at)) {
            n.removeAttribute(at);
          }
        }

        for(j in a) if(a.hasOwnProperty(j)) {
          n.setAttribute(j, a[j]);
        }
      }

      return;

    case rmAttrType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        for(j = 1;j < delta.length;j++){
          n.removeAttribute(delta[j]);
        }
      }

      return;

    case addStylesType:
      a = delta[1];
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];

        for(j in a) if(a.hasOwnProperty(j)) {
          m = a[j].match(/^(.*?)(\s*)!important$/);
          if (m) {
            n.style.setProperty(j, m[1], 'important');
          } else {
            n.style.setProperty(j, a[j]);
          }
        }
      }

      return;

    case rmStylesType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        for(j = 1;j < delta.length;j++){
          n.style.removeProperty(delta[j]);
        }
      }

      return;

    case addClassType:
      a = fromClass(delta[1])
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        m = fromClass(n.className);

        for(j in a) if(a.hasOwnProperty(j)) {
          m[j] = true;
        }

        n.className = toClass(m);
      }

      return;

    case rmClassType:
      a = fromClass(delta[1])
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        m = fromClass(n.className);

        for(j in a) if(a.hasOwnProperty(j)) {
          delete m[j];
        }

        n.className = toClass(m);
      }

      return;

  }
}

export default applyAttributes;
