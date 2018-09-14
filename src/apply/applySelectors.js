import {
  sliceType, rootType, selectorType, selectorAllType, parentType,
  firstChildType, lastChildType, prevSiblingType, nextSiblingType,
} from '../types';

import {
  mapNodes, mapQuerySelector, mapQuerySelectorAll, mapParent,
  mapFirstChild, mapLastChild, mapPrevSibling, mapNextSibling,
} from './utils';

import apply from './apply';

function applyAll(parentDelta, startIndex, rootNode, nodes, cb) {
  var i, d, result;

  for(i = startIndex;i < parentDelta.length;i++) {
    if(result) {
      result.push(parentDelta[i]);
    } else {
      d = apply(parentDelta[i], rootNode, nodes, cb);
      if (d) {
        result = parentDelta.slice(0, startIndex);
        result.push(d);
      }
    }
  }

  return result;
}

function applySelectors(delta, rootNode, nodes, cb){

  switch(delta[0]) {

    case sliceType:
      return applyAll(delta, 1, rootNode, nodes, cb);

    case rootType:
      return applyAll(delta, 1, rootNode, [rootNode], cb);

    case selectorType:
      return applyAll(delta, 2, rootNode, mapNodes(nodes, mapQuerySelector(delta[1])), cb);

    case selectorAllType:
      return applyAll(delta, 2, rootNode, mapNodes(nodes, mapQuerySelectorAll(delta[1])), cb);

    case parentType:
      return applyAll(delta, 1, rootNode, mapNodes(nodes, mapParent), cb);

    case firstChildType:
      return applyAll(delta, 1, rootNode, mapNodes(nodes, mapFirstChild), cb);

    case lastChildType:
      return applyAll(delta, 1, rootNode, mapNodes(nodes, mapLastChild), cb);

    case prevSiblingType:
      return applyAll(delta, 1, rootNode, mapNodes(nodes, mapPrevSibling), cb);

    case nextSiblingType:
      return applyAll(delta, 1, rootNode, mapNodes(nodes, mapNextSibling), cb);

  }

}

export default applySelectors;
