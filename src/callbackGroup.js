import schedule from './schedule'
import once from './once'

function callbackGroup(cb) {
  let waiting = 0;
  const scheduleCb = once(() => schedule(cb))

  function check(){
    if (!waiting) {
      scheduleCb();
    }
  }

  schedule(check);

  return () => {
    waiting++;
    return once(() => {
      waiting--;
      schedule(check);
    })
  }
}

export default callbackGroup