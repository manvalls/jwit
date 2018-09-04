function safeRun(cb, fb){
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
