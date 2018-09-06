import { removeType, clearType } from '../types';

function applyContent(delta, rootNode, nodes, cb){
  var i,j,n,f,fc;

  var total = 0;
  var done = 0;
  var waiting = false;

  function getCallback(){
    var cbDone = false;

    total++;
    return () => {
      if (!cbDone) {
        cbDone = true;
        done++;
        if (waiting && done == total) {
          waiting = false;
          cb();
        }
      }
    };
  }

  switch(delta[0]) {

    case htmlType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        n.innerHTML = delta[1];
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

        for(j = 0;j < f.childNodes.length;j++){
          n.parentNode.insertBefore(f.childNodes[j], n);
        }

        n.parentNode.removeChild(n);
      }

      break;

    case appendType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];

        f = n.cloneNode();
        f.innerHTML = delta[1];

        for(j = 0;j < f.childNodes.length;j++){
          n.appendChild(f.childNodes[j]);
        }
      }

      break;

    case prependType:
      for(i = 0;i < nodes.length;i++){
        n = nodes[i];
        fc = n.firstChild;

        f = n.cloneNode();
        f.innerHTML = delta[1];

        for(j = 0;j < f.childNodes.length;j++){
          n.insertBefore(f.childNodes[j], fc);
        }
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

        for(j = 0;j < f.childNodes.length;j++){
          n.parentNode.insertBefore(f.childNodes[j], n.nextSibling);
        }
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

        for(j = 0;j < f.childNodes.length;j++){
          n.parentNode.insertBefore(f.childNodes[j], n);
        }
      }

      break;

  }

  waiting = true;
  if (total > done) {
    return [0];
  }
}

export default applyContent;
