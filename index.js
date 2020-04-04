function sortWords(words) {
    return words.sort((a,b) => a.length > b.length ? 1 : -1);
}

function generateMap(words) {
    let map = new Map();
    words.forEach(word => {
        for(let i = 0; i < word.length; i++) {
            let value = map.get(word[i]);
            if(value) {
                let index = value.findIndex(value => value === word);
                if(index === -1) value.push(word);
            } else {
                map.set(word[i], [ word ]);
            }
        }
    });
    return map;
}

function getCoordinates(wordMap) {
    let placed = new Set();
    let vertical = [];
    let across = [];
    wordMap.forEach((value, key) => {        
        let words = value.sort((a,b) => a.split(key).length -1 < b.split(key).length -1 ? 1 : -1);        
        let word = {
            key,
            value: words[0],            
            count: words[0].split(key).length - 1,            
            x: 0,
            y: 0,
        };
        let initial = word.value;
        let totalCount = word.count;
        if(!placed.has(word.value)) {
            across.push(word);        
            placed.add(word.value);
            let currIndex = 0;
            words.shift();
            words.forEach(word => {      
                if(!placed.has(word)) {
                    let currWord = across[currIndex];
                    if(currWord.count > 0) {
                        let keyIndex = word.indexOf(letter => letter === key);
                        if(keyIndex !== -1) {
                            let y = currWord.y - keyIndex;
                            let x = -1;
                            x = keyIndex;
                            across[currIndex].value.splice(index, 1);
                            across[currIndex].count--;
                            let currVertical = {
                                key,
                                value: word,
                                count: word.split(key).length -1,
                                x,
                                y
                            }   
                            placed.add(word);
                            return vertical.push(currVertical);
                        }                    
                    } 
                    across[currIndex].value = initial;
                    across[currIndex].count = totalCount;
                    let currAcross = {
                        key,
                        value: word,
                        count: word.split(key).length -1,
                        x: 0,
                        y: 0
                    }   
                    across.push(currAcross);
                    initial = word;
                    totalCount = word.split(key).length - 1;
                    currIndex++;            
                }            
            });
        } 
    });
    console.log(across);
    console.log(vertical);
}

function placeWords(words) {
    let original = [...words];
    let queue = [...original];    
    let placed = new Array();
    let i = 0;
    while(i < 10) {    
        if(i === words.length * 2 - 1) {
            //i = -1;            
            let initial = original[0];
            original.splice(0,1);
            original.push(initial);
            queue = [...original];
            console.log(queue);
            placed = new Array();
        } else {
            let currWord = queue.shift();                        
            let prevLength = placed.length;
            placeWord(currWord, placed);
            if(placed.length === prevLength) {
                queue.push(currWord);
            }
        }        
        i++;
    }
    return placed;
}

function placeWord(currWord, placed) {   
    if(placed.length === 0) {
        placed.push({
            value: currWord,
            x0: 0,
            y0: 0,
            xf: currWord.length,
            yf: 0,
            direction: "across"
        });
    } else {
        let isPlaced = false;  
        placed.forEach(word => {
            if(!isPlaced) {
                let value = word.value;
                for(let i = 0; i < currWord.length; i++) {
                    let index = value.indexOf(currWord[i]);
                    if(index !== -1) {                                
                        let direction = word.direction === "across" ? "vertical" : "across";
                        let x0 = direction === "vertical" ? word.x0 + index : word.x0 - i;
                        let y0 = direction === "vertical" ? word.y0 - i : word.x0 + i + word.y0;
                        let xf = direction === "across" ? x0 + currWord.length : x0;
                        let yf = direction === "vertical" ? y0 + currWord.length : y0;
                        if(placeable(x0,y0,xf,yf,direction, placed)) {
                            placed.push({
                                value: currWord,
                                x0,
                                y0,
                                xf,
                                yf,
                                direction,
                                anchor: currWord[i],
                                index: i,
                                cross: value
                            });
                            isPlaced = true;
                            break
                        }
                    }
                }
            }        
        });
    }    
    return placed;
}

function placeable(x0, y0, xf, yf, direction, placed) {
    if(direction === "across") {
        let xUsed = placed.find(word => word.direction === "across" ? (word.x0 >= x0 || word.xf <= xf) : (word.x0 >= x0 && word.x0 <= xf)) !== undefined;
        let yUsed = placed.find(word => word.y0 === y0) !== undefined;
        return !xUsed && !yUsed;
    } else {
        let xUsed = placed.find(word => word.x0 === x0) !== undefined;
        let yUsed = placed.find(word => word.direction === "across" ? (word.y0 >= y0 || word.yf <= yf) : (word.y0 >= y0 && word.y0 <= yf)) !== undefined;
        return !xUsed && !yUsed;
    }
    
}

const words = ["orlando", "mauricio", "fernando", "elizabeth", "federico"];

const map = placeWords(words);

console.log(map);