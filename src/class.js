
export function fromClass(className){
  var classMap = {};
  var classes = className.split(/[\s\uFEFF\xA0]+/);
  var i,c;

  for (i = 0;i < classes.length;i++) {
    c = classes[i];
    if (c) {
      classMap[c] = true;
    }
  }

  return classMap;
}

export function toClass(classMap){
  var classNames = [];
  var i;

  for (i in classMap) {
    if(classMap.hasOwnProperty(i) && classMap[i]) {
      classNames.push(i);
    }
  }

  return classNames.join(' ');
}
