function sortWords(words) {
  return words.sort((a, b) => (a.value.length > b.value.length ? -1 : 1));
}

function placeWords(words, maxCols, maxRows, limit) {
  words = sortWords(words);
  let original = [...words];
  let queue = [...original];
  let placed = new Array();
  let j = 0;
  let i = 0;
  while (queue.length > 0) {
    if (i === words.length * 2 - 1) {
      i = -1;
      let initial = original[0];
      original.splice(0, 1);
      original.push(initial);
      queue = [...original];
      placed = new Array();
    } else {
      let currWord = queue.shift();
      let prevLength = placed.length;
      placeWord(currWord, placed, maxCols, maxRows);
      if (placed.length === prevLength) {
        queue.push(currWord);
      }
    }
    i++;
    j++;
    if(limit) {
      if(j > limit) throw new Error("No pudo formarse un crucigrama");
    }    
  }
  return placed;
}

function placeWord(currWord, placed, maxCols, maxRows) {
  if (placed.length === 0) {
    placed.push({
      ...currWord,
      x0: 0,
      y0: 0,
      xf: currWord.value.length,
      yf: 0,
      direction: "across",
    });
  } else {
    let isPlaced = false;
    let { xMin, xMax, yMin, yMax } = getGrid(placed);
    placed.forEach((word) => {
      if (!isPlaced) {
        let value = word.value;
        for (let i = 0; i < currWord.value.length; i++) {
          let index = value.indexOf(currWord.value[i]);          
          if (index !== -1) {
            let direction = word.direction === "across" ? "vertical" : "across";
            let x0 = direction === "vertical" ? word.x0 + index : word.x0 - i;
            let y0 =
              direction === "vertical" ? word.y0 - i : word.x0 + i + word.y0;
            let xf = direction === "across" ? x0 + currWord.value.length : x0;
            let yf = direction === "vertical" ? y0 + currWord.value.length : y0;
            if (fitsInGrid(x0, y0, xf, yf, direction, xMin, yMin, xMax, yMax, maxCols, maxRows) && placeable(x0, y0, xf, yf, direction, placed, currWord)) {
              placed.push({
                ...currWord,
                x0,
                y0,
                xf,
                yf,
                direction,
              });
              isPlaced = true;
              break;
            }
          }
        }
      }
    });
  }
  return placed;
}

function fitsInGrid(x0, y0, xf, yf, direction, xMin, yMin, xMax, yMax, maxCols, maxRows) {
  if(direction === "across") {    
    return xf - xMin <= maxCols && xMax - x0 <= maxCols;
  } else {
    return yf - yMin <= maxRows && yMax - y0 <= maxRows;
  }
}

function placeable(x0, y0, xf, yf, direction, placed, currWord) {  
  if (direction === "across") {
    let placedWords = placed.find((word) =>
        word.direction === "across"
          ? word.x0 >= x0 &&
            word.xf <= xf &&
            (word.y0 === y0 || word.y0 === y0 + 1 || word.y0 === y0 - 1)
          : word.y0 >= x0 || word.y0 <= xf
          ? word.value[y0 - word.y0] !== currWord.value[word.x0 - x0]
          : false
      );
      return placedWords === undefined;
  } else {
    let placedWords = placed.find((word) =>
        word.direction === "across"
          ? word.x0 <= x0 && word.xf >= x0 ?
          word.value[x0 - word.x0] !== currWord.value[word.y0 - y0]
          : false
          : (word.x0 === x0 || word.x0 === x0 - 1 || word.x0 === x0 +1)
      );
    return placedWords === undefined;
  }
}

function getGrid(words) {
  let sortedY = words.sort((a,b) => a.y0 < b.y0 ? -1 : 1)
  let yMin = sortedY[0].y0;
  let yMax = sortedY[sortedY.length -1].y0;
  let yDiff = Math.abs(yMin) - 0;
  let sortedX = words.sort((a,b) => a.x0 < b.x0 ? -1 : 1);
  let xMin = sortedX[0].x0;
  let xMax = sortedX[sortedX.length -1].x0
  let xDiff = Math.abs(xMin) - 0;
  let rows = yMax - yMin;
  let cols = xMax - xMin;
  return { yMin, yMax, yDiff, xMin, xMax, xDiff, rows, cols };
}

function formatMatrix(words) {
  const { yDiff, xDiff } = getGrid(words);
  words.forEach(word => {
    word.y0 += yDiff;
    word.x0 += xDiff;
  });
  return words;
}

function generateCrossword(words, maxCols, maxRows, limit) {
  try {
    let map = placeWords(words, maxCols, maxRows, limit);
    return formatMatrix(map);
  } catch (e) {
    throw e;
  }  
}

module.exports = { generateCrossword };