import safeRun from './safeRun';

const queued = [];
let processing = false;

function queue(thunk){
  var errored = false;

  if (processing) {
    queued.push(thunk);
  } else {
    processing = true;
    safeRun(() => thunk(() => {
      if (errored) {
        return;
      }

      processing = false;
      if (queued.length) {
        queue(queued.shift());
      }
    }), () => {
      processing = false;
      errored = true;
    });
  }
}

export default queue;
