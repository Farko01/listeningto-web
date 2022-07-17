const rotateArray = (arr: any[], count: number) => {
  count -= arr.length * Math.floor(count / arr.length);
  arr.push.apply(arr, arr.splice(0, count));
  return arr;
}

export default rotateArray;