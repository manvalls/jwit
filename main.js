(function(w){
  var wit = w['wit'] = w['wit'] || {};

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

  // wit.call

  (function(){
    var queue = [];
    var run;

    if (!wit['call']) {
      wit['call'] = function(path, arg, node){
        var func = w;
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

  // wit factories

  (function(){
    wit['nil'] = [0];
    wit['isNil'] = function(delta){
      return delta[0] == 0;
    };

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
  })();

  // wit.apply

  (function(){

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

    function mapNodes(nodes, mapFn) {
      var result = [];
      var children,i,j,c;

      for(i = 0;i < nodes.length;i++){
        children = mapFn(nodes[i]);
        for(j = 0;j < children.length;j++){
          c = children[j];
          if(c && c.nodeType == 1){
            result.push(c);
          }
        }
      }

      return result;
    }

    function evalUnmountAttr(attr){
      eval(attr);
    }

    function beforeUnmount(node) {
      var beforeUnmountAttr = node.getAttribute('data-beforeunmount');
      if (beforeUnmountAttr != null) {
        try{
          evalUnmountAttr.call(node, beforeUnmountAttr);
          if (node.hasOwnProperty('beforeUnmount') && typeof node.beforeUnmount == 'function') {
              node.beforeUnmount();
          }
        }catch(err){
          setTimeout(function(){
            throw err;
          },0);
        }
      }
    }

    function cleanup(node, inclusive) {
      var children, i;

      if (inclusive) {
        if(node.tagName == 'LINK' && node.rel == 'stylesheet'){
          node.disabled = true;
        }

        beforeUnmount(node);
      }

      children = node.querySelectorAll('link[rel=stylesheet]');
      for(i = 0;i<children.length;i++){
        children[i].disabled = true;
      }

      children = node.querySelectorAll('[data-beforeunmount]');
      for(i = 0;i<children.length;i++){
        beforeUnmount(children[i]);
      }
    }

    function apply(delta, rootNode, nodes, cb) {
      var result;

      switch(delta[0]) {

        case sliceType:
          return applyAll(delta, 1, rootNode, nodes, cb);

        case rootType:
          return applyAll(delta, 1, rootNode, [rootNode], cb);

        case selectorType:
          return applyAll(delta, 2, rootNode, mapNodes(nodes, function(node){
            try{
              return [node.querySelector(delta[1])];
            }catch(err){
              setTimeout(function(){
                throw err;
              },0);
              return [];
            }
          }), cb);

        case selectorAllType:
          return applyAll(delta, 2, rootNode, mapNodes(nodes, function(node){
            try {
              return node.querySelectorAll(delta[1]);
            }catch(err){
              setTimeout(function(){
                throw err;
              },0);
              return [];
            }
          }), cb);

        case parentType:
          return applyAll(delta, 1, rootNode, mapNodes(nodes, function(node){
            return [node.parentNode];
          }), cb);

        case firstChildType:
          return applyAll(delta, 1, rootNode, mapNodes(nodes, function(node){
            var i,n,cn = node.childNodes;

            for(i = 0;i < cn.length;i++){
              n = cn[i];
              if(n.nodeType==1){
                return [n];
              }
            }

            return [];
          }), cb);

        case lastChildType:
          return applyAll(delta, 1, rootNode, mapNodes(nodes, function(node){
            var i,n,cn = node.childNodes;

            for(i = cn.length - 1;i >= 0;i--){
              n = cn[i];
              if(n.nodeType==1){
                return [n];
              }
            }

            return [];
          }), cb);

        case prevSiblingType:
          return applyAll(delta, 1, rootNode, mapNodes(nodes, function(node){
            var ps = node.previousSibling;
            while(ps && ps.nodeType !== 1) ps = ps.previousSibling;
            return ps ? [ps] : [];
          }), cb);

        case nextSiblingType:
          return applyAll(delta, 1, rootNode, mapNodes(nodes, function(node){
            var ns = node.nextSibling;
            while(ns && ns.nodeType !== 1) ns = ns.nextSibling;
            return ns ? [ns] : [];
          }), cb);

      }

    }

    wit['apply'] = function witApply(delta, rootNode){
      rootNode = rootNode || document.documentElement;
      return function(cb){
        var delayedDelta = apply(delta, rootNode, [rootNode], function(){
          witApply(delayedDelta, rootNode)(cb);
        });

        if (!delayedDelta) {
          cb();
        }
      };
    };

  })();

  if(typeof module != 'undefined') module['exports'] = wit;
})(typeof window == 'undefined' ? self : window);
