import {
  sliceType,
  rootType, selectorType, selectorAllType, parentType,
  firstChildType, lastChildType, prevSiblingType, nextSiblingType,
  removeType, clearType,
  htmlType, replaceType, appendType,
  prependType, insertAfterType, insertBeforeType,
  addAttrType, setAttrType, rmAttrType,
  addStylesType, rmStylesType, addClassType,
  rmClassType,
} from '../types';

import {
  mapNodes, mapQuerySelector, mapQuerySelectorAll, mapParent,
  mapFirstChild, mapLastChild, mapPrevSibling, mapNextSibling,
} from './utils';

import callbackGroup from '../callbackGroup';
import schedule from '../schedule';

import safeRun from '../safeRun';
import { fromClass, toClass } from '../class'
import { getHooksRunner, destroy, destroyChildren, getControllers } from '../hook';

function setAttribute(node, key, value){
  node.setAttribute(key, value);
  if (key == 'value' && node.tagName.toLowerCase() == 'input') {
    node.value = value;
  }
}

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

function applyAll(parentDelta, startIndex, rootNode, nodes, cg) {
  for(let i = startIndex;i < parentDelta.length;i++) {
    apply(parentDelta[i], rootNode, nodes, cg());
  }
}

function apply(delta, rootNode, nodes, cb) {
  schedule(() => {
    var i,j,n,a,m,at,f,fc,r;
    const cg = callbackGroup(cb)

    function fireAttrChange(){
      for(let i = 0;i < nodes.length;i++){
        const controllers = getControllers(nodes[i]);
        for(let i = 0;i < controllers.length;i++){
          const ctrl = controllers[i];
          if(typeof ctrl.attrChange == 'function') safeRun(() => ctrl.attrChange(cg));
        }
      }
    }

    switch(delta[0]) {

      case sliceType:
        return applyAll(delta, 1, rootNode, nodes, cg);
  
      case rootType:
        return applyAll(delta, 1, rootNode, [rootNode], cg);
  
      case selectorType:
        return applyAll(delta, 2, rootNode, mapNodes(nodes, mapQuerySelector(delta[1])), cg);
  
      case selectorAllType:
        return applyAll(delta, 2, rootNode, mapNodes(nodes, mapQuerySelectorAll(delta[1])), cg);
  
      case parentType:
        return applyAll(delta, 1, rootNode, mapNodes(nodes, mapParent), cg);
  
      case firstChildType:
        return applyAll(delta, 1, rootNode, mapNodes(nodes, mapFirstChild), cg);
  
      case lastChildType:
        return applyAll(delta, 1, rootNode, mapNodes(nodes, mapLastChild), cg);
  
      case prevSiblingType:
        return applyAll(delta, 1, rootNode, mapNodes(nodes, mapPrevSibling), cg);
  
      case nextSiblingType:
        return applyAll(delta, 1, rootNode, mapNodes(nodes, mapNextSibling), cg);

      case htmlType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i];
          destroyChildren(n, cg);
          n.innerHTML = delta[1];
          replaceScripts(n);
          getHooksRunner(n)(cg);
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
  
          while(f.childNodes[0]){
            n.parentNode.insertBefore(f.childNodes[0], n);
          }
  
          destroy(n, cg);
          n.parentNode.removeChild(n);
          r(cg);
        }
  
        break;
  
      case appendType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i];
  
          f = n.cloneNode();
          f.innerHTML = delta[1];
          replaceScripts(f);
          r = getHooksRunner(f);
  
          while(f.childNodes[0]){
            n.appendChild(f.childNodes[0]);
          }
  
          r(cg);
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
  
          while(f.childNodes[0]){
            n.insertBefore(f.childNodes[0], fc);
          }
  
          r(cg);
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
  
          while(f.childNodes[0]){
            n.parentNode.insertBefore(f.childNodes[0], n.nextSibling);
          }
  
          r(cg);
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
  
          while(f.childNodes[0]){
            n.parentNode.insertBefore(f.childNodes[0], n);
          }
  
          r(cg);
        }
  
        break;
  
      case removeType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i];
          if (n.parentNode) {
            destroy(n, cg);
            n.parentNode.removeChild(n);
          }
        }
  
        break;
  
      case clearType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i];
          destroyChildren(n, cg);
          n.innerHTML = '';
        }
  
        break;

      case addAttrType:
        a = delta[1];
        for(i = 0;i < nodes.length;i++){
          n = nodes[i];
          for(j in a) if(a.hasOwnProperty(j)) {
            setAttribute(n, j, a[j]);
          }
        }
        
        fireAttrChange();
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
            setAttribute(n, j, a[j]);
          }
        }
  
        fireAttrChange();
        break;
  
      case rmAttrType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i];
          for(j = 1;j < delta.length;j++){
            n.removeAttribute(delta[j]);
          }
        }
  
        fireAttrChange();
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
  
        fireAttrChange();
        break;
  
      case rmStylesType:
        for(i = 0;i < nodes.length;i++){
          n = nodes[i];
          for(j = 1;j < delta.length;j++){
            n.style.removeProperty(delta[j]);
          }
        }
  
        fireAttrChange();
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
  
        fireAttrChange();
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
  
        fireAttrChange();
        break;

    }
  })
}

export default apply;