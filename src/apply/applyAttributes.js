import {
  addAttrType, setAttrType, rmAttrType,
  addStylesType, rmStylesType, addClassType,
  rmClassType,
} from '../types';

import getCallbackFactory from '../getCallbackFactory';
import { getControllers } from '../hook';
import { fromClass, toClass } from '../class'
import safeRun from '../safeRun';

function applyAttributes(delta, rootNode, nodes, cb){
  var i,j,n,a,m,at;

  const arr = getCallbackFactory(cb);
  const getCallback = arr[0];
  const waiting = arr[1];

  switch(delta[0]) {

    case addAttrType:
      a = delta[1];
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        for(j in a) if(a.hasOwnProperty(j)) {
          n.setAttribute(j, a[j]);
        }
      }

      break;

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

      break;

    case rmAttrType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        for(j = 1;j < delta.length;j++){
          n.removeAttribute(delta[j]);
        }
      }

      break;

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

      break;

    case rmStylesType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        for(j = 1;j < delta.length;j++){
          n.style.removeProperty(delta[j]);
        }
      }

      break;

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

      break;

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

      break;

  }

  for(let i = 0;i < nodes.length;i++){
    const controllers = getControllers(nodes[i]);
    for(let i = 0;i < controllers.length;i++){
      const ctrl = controllers[i];
      if(typeof ctrl.attrChange == 'function') safeRun(() => ctrl.attrChange(getCallback));
    }
  }

  if (waiting()) {
    return [0];
  }
}

export default applyAttributes;
