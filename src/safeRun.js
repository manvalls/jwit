function safeRun(cb){
  try{
    return cb();
  }catch(err){
    setTimeout(() => { throw err; }, 0);
  }
}

export default safeRun;
