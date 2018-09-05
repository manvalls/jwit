import safeRun from './safeRun';

const queued = [];
let processing = false;

function finishProcessing(){
  processing = false;
  if (queued.length) {
    queue(queued.shift());
  }
}

function queue(thunk){
  var errored = false;
  var called = false;

  if (processing) {
    queued.push(thunk);
  } else {
    processing = true;
    safeRun(() => thunk(() => {
      if (errored) {
        return;
      }

      called = true;
      finishProcessing();
    }), () => {
      if (called) {
        return;
      }
      
      errored = true;
      finishProcessing();
    });
  }
}

export default queue;
