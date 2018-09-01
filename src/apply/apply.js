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

import applySelectors from './applySelectors';
import applyDestructors from './applyDestructors';
import applyAttributes from './applyAttributes';
import applyContent from './applyContent';

function apply(delta, rootNode, nodes, cb) {

  switch(delta[0]) {

    // Selectors

    case sliceType:
    case rootType:
    case selectorType:
    case selectorAllType:
    case parentType:
    case firstChildType:
    case lastChildType:
    case prevSiblingType:
    case nextSiblingType:
      return applySelectors(delta, rootNode, nodes, cb);

    // Destructors

    case removeType:
    case clearType:
      return applyDestructors(delta, rootNode, nodes, cb);

    // Content

    case htmlType:
    case replaceType:
    case appendType:
    case prependType:
    case insertAfterType:
    case insertBeforeType:
      return applyContent(delta, rootNode, nodes, cb);

    // Attributes

    case addAttrType:
    case setAttrType:
    case rmAttrType:
    case addStylesType:
    case rmStylesType:
    case addClassType:
    case rmClassType:
      return applyAttributes(delta, rootNode, nodes, cb);

  }

}

export default apply;
