import safeRun from './safeRun';

function event(){
  var listeners = {};
  var nextId = 0;
  var event = {};

  event.subscribe = callback => {
    var id = nextId++;
    listeners[id] = callback;
    return () => {
      delete listeners[id];
    };
  };

  event.trigger = () => {
    var i;
    for(i in listeners) if(listeners.hasOwnProperty(i)){
      safeRun(() => listeners[i].apply(this, arguments));
    }
  };

  return event;
}

export default event;
