import safeRun from './safeRun';

const queued = [];
let processing = true;

function finishProcessing(){
  processing = false;
  if (queued.length) {
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
    queued.push(thunk);
  } else {
    processing = true;
    safeRun(() => thunk(whenDone), whenDone);
  }
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

if (document.readyState == 'complete') {
  finishProcessing();
} else if(window.addEventListener) {
  window.addEventListener('load', init, false);
  document.addEventListener('DOMContentLoaded', init, false);
} else if(window.attachEvent) {
  window.attachEvent('onload', init);
}

export default queue;
