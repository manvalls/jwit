(function(){
  function evalCode(code){
    eval(code);
  }

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

      function beforeUnmount(node) {
        var beforeUnmountAttr = node.getAttribute('data-beforeunmount');
        if (beforeUnmountAttr != null) {
          try{
            evalCode.call(node, beforeUnmountAttr);
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

      function attach(node, c, cb) {
        function callback(){
          c.done++;
          if (c.done == c.total) {
            cb();
          }
        }

        c.total++;

        if (node.addEventListener) {
          node.addEventListener('load', callback, false);
          node.addEventListener('error', callback, false);
        } else if (node.attachEvent) {
          node.attachEvent('onload', callback);
          node.attachEvent('onerror', callback);
        }
      }

      function hook(node, c, cb) {
        var i,j,n,s,a,at;
        var toListen = [];
        var links = node.querySelectorAll('link[rel=stylesheet]');
        var scripts = node.querySelectorAll('script');

        for(i = 0;i < links.length;i++){
          n = links[i];
          if(!n.sheet){
            toListen.push(n);
          }
        }

        for(i = 0;i < scripts.length;i++){
          n = scripts[i];
          s = document.createElement('script');
          s.text = n.text;
          for(j = n.attributes.length-1;j >= 0;j--){
            a = n.attributes[j];
            s.setAttribute(a.name, a.value);
          }

          n.parentNode.replaceChild(s, n);
          if(s.src){
            toListen.push(s);
          }
        }

        for(i = 0;i < toListen.length;i++){
          n = toListen[i];
          if('onload' in n && 'onerror' in n){
            attach(n, c, cb);
          }
        }
      }

      function afterChange(node){
        var afterChangeAttr = node.getAttribute('data-afterchange');
        if (afterChangeAttr != null) {
          try{
            evalCode.call(node, afterChangeAttr);
            if (node.hasOwnProperty('afterChange') && typeof node.afterChange == 'function') {
                node.afterChange();
            }
          }catch(err){
            setTimeout(function(){
              throw err;
            },0);
          }
        }
      }

      function parseClass(className){
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

      function buildClass(classMap){
        var classNames = [];
        var i;

        for (i in classMap) {
          if(classMap.hasOwnProperty(i)) {
            classNames.push(i);
          }
        }

        return classNames.join(' ');
      }

      function apply(delta, rootNode, nodes, cb) {
        var result,i,j,n,c,f,fc,a,m;

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

          case removeType:
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              cleanup(n, true);
              if (n.parentNode) {
                n.parentNode.removeChild(n);
              }
            }

            return;

          case clearType:
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              cleanup(n, false);
              n.innerHTML = '';
            }

            return;

          case htmlType:
            c = {total: 0, done: 0};
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              cleanup(n, false);
              n.innerHTML = delta[1];
              hook(n, c, cb);
            }

            return c.total > c.done ? [0] : null;

          case replaceType:
            c = {total: 0, done: 0};
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              if (!n.parentNode) {
                continue;
              }

              cleanup(n, true);
              f = n.parentNode.cloneNode();
              f.innerHTML = delta[1];
              hook(f, c, cb);

              for(j = 0;j < f.childNodes.length;j++){
                n.parentNode.insertBefore(f.childNodes[j], n);
              }

              n.parentNode.removeChild(n);
            }

            return c.total > c.done ? [0] : null;

          case appendType:
            c = {total: 0, done: 0};
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];

              f = n.cloneNode();
              f.innerHTML = delta[1];
              hook(f, c, cb);

              for(j = 0;j < f.childNodes.length;j++){
                n.appendChild(f.childNodes[j]);
              }
            }

            return c.total > c.done ? [0] : null;

          case prependType:
            c = {total: 0, done: 0};
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              fc = n.firstChild;

              f = n.cloneNode();
              f.innerHTML = delta[1];
              hook(f, c, cb);

              for(j = 0;j < f.childNodes.length;j++){
                n.insertBefore(f.childNodes[j], fc);
              }
            }

            return c.total > c.done ? [0] : null;

          case insertAfterType:
            c = {total: 0, done: 0};
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              if (!n.parentNode) {
                continue;
              }

              f = n.parentNode.cloneNode();
              f.innerHTML = delta[1];
              hook(f, c, cb);

              for(j = 0;j < f.childNodes.length;j++){
                n.parentNode.insertBefore(f.childNodes[j], n.nextSibling);
              }
            }

            return c.total > c.done ? [0] : null;

          case insertBeforeType:
            c = {total: 0, done: 0};
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              if (!n.parentNode) {
                continue;
              }

              f = n.parentNode.cloneNode();
              f.innerHTML = delta[1];
              hook(f, c, cb);

              for(j = 0;j < f.childNodes.length;j++){
                n.parentNode.insertBefore(f.childNodes[j], n);
              }
            }

            return c.total > c.done ? [0] : null;

          case addAttrType:
            a = delta[1];
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              for(j in a) if(a.hasOwnProperty(j)) {
                n.setAttribute(j, a[j]);
              }

              afterChange(n);
            }

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
                n.setAttribute(j, a[j]);
              }

              afterChange(n);
            }

          case rmAttrType:
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              for(j = 1;j < delta.length;j++){
                n.removeAttribute(delta[j]);
              }

              afterChange(n);
            }

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

              afterChange(n);
            }

          case rmStylesType:
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              for(j = 1;j < delta.length;j++){
                n.style.removeProperty(delta[j]);
              }

              afterChange(n);
            }

          case addClassType:
            a = parseClass(delta[1])
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              m = parseClass(n.className);

              for(j in a) if(a.hasOwnProperty(j)) {
                m[j] = true;
              }

              n.className = buildClass(m);
              afterChange(n);
            }

          case rmClassType:
            a = parseClass(delta[1])
            for(i = 0;i < nodes.length;i++){
              n = nodes[i];
              m = parseClass(n.className);

              for(j in a) if(a.hasOwnProperty(j)) {
                delete m[j];
              }

              n.className = buildClass(m);
              afterChange(n);
            }

        }

      }

      wit['apply'] = function witApply(delta, rootNode){
        rootNode = rootNode || document.documentElement;
        return function(cb){
          var delayedDelta = apply(delta, rootNode, [rootNode], function(){
            witApply(delayedDelta, rootNode)(cb);
          });

          if (!delayedDelta) {
            setTimeout(cb, 0);
          }
        };
      };

    })();

    if(typeof module != 'undefined') module['exports'] = wit;
  })(typeof window == 'undefined' ? self : window);

})();
