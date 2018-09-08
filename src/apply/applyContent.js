import { removeType, clearType } from '../types';
import getCallbackFactory from '../getCallbackFactory';
import { destroy, getHooksRunner } from '../hook';

function replaceScripts(container){
  const scripts = container.querySelectorAll('script');
  let i,n,s,j,a;

  for(i = 0;i < scripts.length;i++){
    n = scripts[i];
    s = document.createElement('script');
    s.text = n.text;
    for(j = n.attributes.length-1;j >= 0;j--){
      a = n.attributes[j];
      s.setAttribute(a.name, a.value);
    }

    n.parentNode.replaceChild(s, n);
  }
}

function applyContent(delta, rootNode, nodes, cb){
  var i,j,n,f,fc,r;

  const arr = getCallbackFactory(cb);
  const getCallback = arr[0];
  const waiting = arr[1];

  switch(delta[0]) {

    case htmlType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        destroy(n);
        n.innerHTML = delta[1];
        replaceScripts(n);
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
        replaceScripts(f);
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
        replaceScripts(f);
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
        replaceScripts(f);
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
        replaceScripts(f);
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
        replaceScripts(f);
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
