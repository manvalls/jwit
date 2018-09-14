
function getCallbackFactory(cb){
  var total = 0;
  var done = 0;
  var waiting = false;

  function getCallback(){
    var cbDone = false;

    total++;
    return () => {
      if (!cbDone) {
        cbDone = true;
        done++;
        if (waiting && done == total) {
          waiting = false;
          cb();
        }
      }
    };
  }

  function checkWaiting(){
    if (total > done) {
      waiting = true;
    }

    return waiting;
  }

  return [getCallback, checkWaiting];
}

export default getCallbackFactory;
