function safeRun(cb, fb){
  if (!cb) {
    return
  }
  
  try{
    return cb();
  }catch(err){
    setTimeout(() => { throw err; }, 0);
    if (fb) {
      safeRun(() => fb(err));
    }
  }
}

export default safeRun;
