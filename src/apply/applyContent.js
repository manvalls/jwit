import { removeType, clearType } from '../types';
import getCallbackFactory from '../getCallbackFactory';
import { destroy, getHooksRunner } from '../hook';

function applyContent(delta, rootNode, nodes, cb){
  var i,j,n,f,fc,r;

  const [getCallback, waiting] = getCallbackFactory(cb);

  switch(delta[0]) {

    case htmlType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        destroy(n);
        n.innerHTML = delta[1];
        getHooksRunner(n)(getCallback);
      }

      break;

    case replaceType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        if (!n.parentNode) {
          continue;
        }

        f = n.parentNode.cloneNode();
        f.innerHTML = delta[1];
        r = getHooksRunner(f);

        for(j = 0;j < f.childNodes.length;j++){
          n.parentNode.insertBefore(f.childNodes[j], n);
        }

        destroy(n, true);
        n.parentNode.removeChild(n);
        r(getCallback);
      }

      break;

    case appendType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];

        f = n.cloneNode();
        f.innerHTML = delta[1];
        r = getHooksRunner(f);

        for(j = 0;j < f.childNodes.length;j++){
          n.appendChild(f.childNodes[j]);
        }

        r(getCallback);
      }

      break;

    case prependType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        fc = n.firstChild;

        f = n.cloneNode();
        f.innerHTML = delta[1];
        r = getHooksRunner(f);

        for(j = 0;j < f.childNodes.length;j++){
          n.insertBefore(f.childNodes[j], fc);
        }

        r(getCallback);
      }

      break;

    case insertAfterType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        if (!n.parentNode) {
          continue;
        }

        f = n.parentNode.cloneNode();
        f.innerHTML = delta[1];
        r = getHooksRunner(f);

        for(j = 0;j < f.childNodes.length;j++){
          n.parentNode.insertBefore(f.childNodes[j], n.nextSibling);
        }

        r(getCallback);
      }

      break;

    case insertBeforeType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        if (!n.parentNode) {
          continue;
        }

        f = n.parentNode.cloneNode();
        f.innerHTML = delta[1];
        r = getHooksRunner(f);

        for(j = 0;j < f.childNodes.length;j++){
          n.parentNode.insertBefore(f.childNodes[j], n);
        }
        
        r(getCallback);
      }

      break;

  }

  if (waiting()) {
    return [0];
  }
}

export default applyContent;
