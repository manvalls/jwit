(function(){
  var wit = window['wit'] = window['wit'] || {};

  (function(){
    var queue = [];
    var run;

    if (!wit['call']) {
      wit['call'] = function(path, arg, node){
        var func = window;
        node = node || document.scripts[document.scripts.length - 1].parentNode;

        var that;
        var i;
        for(i = 0;i < path.length;i++){
          that = func;
          func = func[path[i]];

          if (!func) {
            queue.push([path, arg, node]);
            return;
          }
        }

        func.call(that, arg, node);
      };

      run = wit['run'];
      wit['run'] = function(){
        var elem;
        var q = queue;
        var i;

        queue = [];
        for(i = 0;i < q.length;i++){
          try{
            wit['call'](q[i][0], q[i][1], q[i][2]);
          }catch(err){
            setTimeout(function(){
              throw err;
            }, 0);
          }
        }

        if(run) {
          run();
        }
      };
    }
  })();

  var sliceType = 1;

  var rootType = 2;
  var selectorType = 3;
  var selectorAllType = 4;
  var parentType = 5;
  var firstChildType = 6;
  var lastChildType = 7;
  var prevSiblingType = 8;
  var nextSiblingType = 9;

  var removeType = 10;
  var clearType = 11;

  var htmlType = 12;
  var replaceType = 13;
  var appendType = 14;
  var prependType = 15;
  var insertAfterType = 16;
  var insertBeforeType = 17;

  var addAttrType = 18;
  var setAttrType = 19;
  var rmAttrType = 20;
  var addStylesType = 21;
  var rmStylesType = 22;
  var addClassType = 23;
  var rmClassType = 24;

  var callType = 25;

  function isNil(delta){
    return delta[0] == 0;
  }

  wit['nil'] = [0];
  wit['isNil'] = isNil;

  var deltaPairs = [
    ['list', sliceType],
    ['root', rootType],
    ['one', selectorType],
    ['all', selectorAllType],
    ['parent', parentType],
    ['firstChild', firstChildType],
    ['lastChild', lastChildType],
    ['prevSibling', prevSiblingType],
    ['nextSibling', nextSiblingType],
    ['html', htmlType],
    ['replace', replaceType],
    ['append', appendType],
    ['prepend', prependType],
    ['insertAfter', insertAfterType],
    ['insertBefore', insertBeforeType],
    ['addAttr', addAttrType],
    ['setAttr', setAttrType],
    ['rmAttr', rmAttrType],
    ['addStyles', addStylesType],
    ['rmStyles', rmStylesType],
    ['addClass', addClassType],
    ['rmClass', rmClassType],
    ['call', callType],
  ];

  wit['remove'] = [removeType];
  wit['clear'] = [clearType];

  function defineFactory(p){
    wit[p[0]] = function(){
      var result = [p[1]];
      for(var i = 0;i < arguments.length;i++) {
        result.push(arguments[i])
      }

      return result;
    };
  }

  for (var i = 0;i < deltaPairs.length;i++) {
    defineFactory(deltaPairs[i]);
  }

  if(typeof module != 'undefined') module['exports'] = wit;
})();
