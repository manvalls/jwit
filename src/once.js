function once(fn){
  let done = false;
  return () => {
    if (done) {
      return;
    }

    done = true;
    fn();
  }
}

export default once;