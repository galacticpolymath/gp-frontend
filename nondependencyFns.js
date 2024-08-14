/* eslint-disable indent */

export const getChunks = (arr, chunkSize) => {
    const chunks = [];
    let chunkWindow = [];
  
    for (let index = 0; index < arr.length; index++) {
      let val = arr[index];
  
      if (chunkWindow.length === chunkSize) {
        chunks.push(chunkWindow);
        chunkWindow = [];
      }
  
      chunkWindow.push(val);
  
      if (index === (arr.length - 1)) {
        chunks.push(chunkWindow);
      }
    }
  
    return chunks;
  };