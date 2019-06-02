function empty(obj) {
  for(let i in obj) if(obj.hasOwnProperty(i)) {
    return false;
  }

  return true;
}

export default empty