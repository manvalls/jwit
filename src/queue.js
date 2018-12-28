import safeRun from './safeRun';

const queued = [];
const tokens = [];
let processing = true;

function finishProcessing(){
  processing = false;
  if (queued.length) {
    tokens.shift();
    queue(queued.shift());
  }
}

function queue(thunk){
  var called = false;

  function whenDone(){
    if (called) {
      return;
    }

    called = true;
    finishProcessing();
  }

  if (processing) {
    const token = {};
    queued.push(thunk);
    tokens.push(token);

    return () => {
      const i = tokens.indexOf(token);
      if (i != -1) {
        tokens.splice(i, 1);
        queued.splice(i, 1);
      }
    };
  }

  processing = true;
  safeRun(() => thunk(whenDone), whenDone);
  return () => {};
}

function init(){
  if(window.removeEventListener) {
    window.removeEventListener('load', init, false);
    document.removeEventListener('DOMContentLoaded', init, false);
  } else if(window.detachEvent) {
    window.detachEvent('onload', init);
  }

  finishProcessing();
}

if (document.readyState == 'complete' || document.readyState == 'interactive') {
  finishProcessing();
} else if(window.addEventListener) {
  window.addEventListener('load', init, false);
  document.addEventListener('DOMContentLoaded', init, false);
} else if(window.attachEvent) {
  window.attachEvent('onload', init);
}

export default queue;
