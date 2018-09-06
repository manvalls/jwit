import safeRun from './safeRun';

const queued = [];
let processing = false;

function queue(thunk){
  var called = false;

  function whenDone(){
    if (called) {
      return;
    }

    called = true;
    processing = false;
    if (queued.length) {
      queue(queued.shift());
    }
  }

  if (processing) {
    queued.push(thunk);
  } else {
    processing = true;
    safeRun(() => thunk(whenDone), whenDone);
  }
}

export default queue;
