import safeRun from './safeRun'

let processing = false;
let queue = [];

function schedule(cb, fb){
  queue.push({ cb, fb });

  if (!processing) {
    processing = true;

    while(queue.length){
      const currentQueue = queue;
      queue = [];
      
      for(let i = 0;i < currentQueue.length;i++){
        const { cb, fb } = currentQueue[i];
        safeRun(cb, fb);
      }
    }

    processing = false;
  }
}

export default schedule