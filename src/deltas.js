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
} from './types';

function factory(type){
  return function(){
    var result = [type];

    for(let i = 0;i < arguments.length;i++) {
      result.push(arguments[i])
    }

    return result;
  };
}

export const nil = [0];
export const remove = [removeType];
export const clear = [clearType];

export const list =           factory(sliceType);
export const root =           factory(rootType);
export const one =            factory(selectorType);
export const all =            factory(selectorAllType);
export const parent =         factory(parentType);
export const firstChild =     factory(firstChildType);
export const lastChild =      factory(lastChildType);
export const prevSibling =    factory(prevSiblingType);
export const nextSibling =    factory(nextSiblingType);
export const html =           factory(htmlType);
export const replace =        factory(replaceType);
export const append =         factory(appendType);
export const prepend =        factory(prependType);
export const insertAfter =    factory(insertAfterType);
export const insertBefore =   factory(insertBeforeType);
export const addAttr =        factory(addAttrType);
export const setAttr =        factory(setAttrType);
export const rmAttr =         factory(rmAttrType);
export const addStyles =      factory(addStylesType);
export const rmStyles =       factory(rmStylesType);
export const addClass =       factory(addClassType);
export const rmClass =        factory(rmClassType);
