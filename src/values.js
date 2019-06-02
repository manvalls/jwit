function values(map){
  var result = [], i;
  for (i in map) if(map.hasOwnProperty(i)) {
    result.push(map[i]);
  }

  return result;
}

export default values