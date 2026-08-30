
//rule: 
// say the grid is
// [1, blank]
// [1, 5]
// in the bottom left corner, you must place either [1, 1] or [1, 5]. If you don't have one of these,
// then you must place the other.
// (I don't really know how to describe this rule...)

// rule:
// if a domino can only be placed in exactly one area, then you must place the domino in that area.

//rule:
// if an area can only be placed by one domino, then that domino must go into that place.
// (this won't solve the problem at the top if there is for example, you don't have 1,1 but there are two areas that a domino can go.)

//rule: 
// if there are limited number of dominos that can fit in a single cell,
// and the structure forces the next element to be a in a double cell with 7, 8, 9, 10, 11 or 12
// then you know that what the minimum value of the element within the double cell must be.
// (1, 2, 3, 4, 5 or 6 respectively).

//rule:
// two cells with 12 is equivalent to each being a single cell requiring a 6. Similarly,
// three cells with 18 is equivalent to all using 6. And so on...

//rule:
// two cells with 11 means one cell gets 6 and the other 5 (so it must use one of each from these counts)
// 3 cells with 17 means that two cells get 6 and one gets 5.

//rule:
// two cells with 10 means either 6+4 or 5+5. 
// two cells with 9 means either 6+3 or 5+4. 
// two cells with 8 means either 6+2 or 5+3 or 4+4. 
// two cells with 7 means either 6+1 or 5+2 or 4+3. 
// what was the point of the (minimum cell value, if you have this?)

//rule: 
// if there is a region where all are equal, then count the number of each type of domino first. Only ones
// that have a number that is greater than or equal to the number of equal cells could be place there. ]
// Additionally, you need to subtract the number of single regions with this value from the count of dominoes of that value.

//rule:
// if there is only one domino that can fit the condition for a region
// and you know what the exact structure looks like around that region, then you can fill it.
// (do I have in mind only regions with 2 cells?)

// rule:
// Take the difference of the the sum of the regions and the sum of the dominoes. The sum of blank cells, equal cells and
// cells which specify a greater than or less than condition equals this difference.

// rule:
// if a group of cells is <2, it is either 0 or 1. If there is more than one cell, then it must use at least 1 zero value.


// board is an array of objects. Each object contains the following:
// indices: An array of coordinate pairs [row, col].
// type: either sum, less, greater, equals, unequals or empty
// target: the target value in the sum, less or greater cases. 
let rowMin = 0;
let colMin = 0;
let rowMax = 0;
let colMax = 0;

let indicesToRegion = {};
const validIndices = new Set();

const getBoardCoords = (board) => {
    board.forEach((entry) => {
        entry.indices.forEach((index) => {
            if (entry.type === 'unequals') {
                entry.type = 'set';
                entry.target = new Set([0, 1, 2, 3, 4, 5, 6]);
            }
            indicesToRegion[index] = { type: entry.type, target: entry.target, indices: entry.indices, numberOfCells: entry.indices.length };
            validIndices.add(`${index[0]},${index[1]}`);

            rowMin = Math.min(rowMin, index[0]);
            colMin = Math.min(colMin, index[1]);

            rowMax = Math.max(rowMax, index[0]);
            colMax = Math.max(colMax, index[1]);
        });

    })
    return
}

let counter = 0
const getConstantValue = () => {
    return ++counter;
}

const DOWN = getConstantValue();
const UP = getConstantValue();
const LEFT = getConstantValue();
const RIGHT = getConstantValue();
const OUT_OF_BOUNDS = getConstantValue();

// this rule rarely helps...
// dominoes is a 2D array. Each inner array is a pair of values, where the top value is the left of the domino and the bottom is the right of the domino (as they are shown horizontally when opening the game)
// const rule_canOnlyBePlacedInOneArea = (dominoes) => {
//     // return where it can be placed (if there is really only one place) placeArea[0] is place of left and placeArea[1] is the place of the right.
//     let placeArea = [];
//     for (domino of dominoes) {
//         let placeCount = 0
//         // consider the domino in each orientation in each cell. Many times, one of the ends will be out of bounds (can obviously disqualify that)
//         for (let i = rowMin; i < rowMax; ++i) {
//             if (!rowSet.has(i))
//                 continue;
//             for (let j = colMin; j < colMax; ++j) {
//                 if (!columnSet.has(j))
//                     continue;
//                 if (rowSet.has(i - 1))
//                     placeCount += check(i - 1, j, domino, DOWN);
//                 if (placeCount > 1)
//                     return false;
//                 if (rowSet.has(i + 1))
//                     placeCount += check(i + 1, j, domino, UP);
//                 if (placeCount > 1)
//                     return false;
//                 if (columnSet.has(j - 1))
//                     placeCount += check(i, j - 1, domino, LEFT);
//                 if (placeCount > 1)
//                     return false;
//                 if (columnSet.has(j + 1))
//                     placeCount += check(i, j + 1, domino, RIGHT);
//                 if (placeCount > 1)
//                     return false;
//             }
//         }
//     }
//     // if there is no place to put the cell, then either something is wrong with the puzzle (this shouldn't be possible if it's an official puzzle)
//     // or you had placed an earlier cell incorrectly.
//     if (placeCount == 0)
//         return false;
//     return placeArea;
// }

const rule_canOnlyBePlacedByOneDomino = (dominoes) => {
    const foundAreasAndDominoes = [];
    const foundDominoes = [];
    for (let i = rowMin; i <= rowMax; ++i) {
        for (let j = colMin; j <= colMax; ++j) {
            if (isOutOfBounds(i, j))
                continue;
            let validCount = 0;
            let validDomino = null;
            let validDirection = null;
            const originalConditions = JSON.stringify(indicesToRegion);
            let validDirections = [DOWN, UP, LEFT, RIGHT];
            validDirections = validDirections.filter(direction => {
                if (direction === DOWN) {
                    return !isOutOfBounds(i + 1, j);
                }
                if (direction === UP) {
                    return !isOutOfBounds(i - 1, j);
                }
                if (direction === LEFT) {
                    return !isOutOfBounds(i, j - 1);
                }
                if (direction === RIGHT) {
                    return !isOutOfBounds(i, j + 1);
                }
            })
            if (validDirections.length > 2)
                continue;
            outerLoop: for (const domino of dominoes) {
                // this doesn't account for the case where you have the same domino twice (rare)
                if (foundDominoes.includes(domino))
                    continue;
                if (!satisfiesRegionConditions(i, j, domino[0]))
                    continue;
                adjustConditions([{ cell: [i, j], value: domino[0] }])

                for (const direction of validDirections) {
                    // if there are only two options to consider (like in a corner) and only one of them is possible, then you must place the domino there.
                    let result = check(i, j, domino, direction);

                    if (result === true) {
                        validCount++;
                        validDomino = domino;
                        validDirection = direction;
                    }
                    if (validCount > 1)
                        break outerLoop;
                }
                // revert to a new copy each time.
                indicesToRegion = JSON.parse(originalConditions);
            }
            if (validCount === 1) {
                let otherIndices = [];
                switch (validDirection) {
                    case DOWN:
                        otherIndices = [i + 1, j];
                        break;
                    case UP:
                        otherIndices = [i - 1, j];
                        break;
                    case LEFT:
                        otherIndices = [i, j - 1];
                        break;
                    case RIGHT:
                        otherIndices = [i, j + 1];
                        break;
                }
                adjustConditions([{ cell: [i, j], value: validDomino[0] }, { cell: otherIndices, value: validDomino[1] }]);

                // this value is used for checking if something is out of bounds.
                // but it is also used to check if a domino collides with another one.
                validIndices.delete(`${i},${j}`);
                validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);

                foundAreasAndDominoes.push({
                    area: [i, j],
                    domino: validDomino,
                    direction: validDirection
                });
                foundDominoes.push(validDomino);
            }
            else
                indicesToRegion = JSON.parse(originalConditions);
        }
    }
    return foundAreasAndDominoes;
}



// checks if it is possible for domino to go into [row, col]. assume that row and col exist in the grid.
// need to use data from current board solve
const check = (row, col, domino, direction) => {

    if (direction === DOWN) {
        if (isOutOfBounds(row + 1, col)) {
            return OUT_OF_BOUNDS;
        }
        // if domino[0] doesn't satisfy these conditions, then return invalid;
        return satisfiesRegionConditions(row + 1, col, domino[1]);
    }
    else if (direction === UP) {
        if (isOutOfBounds(row - 1, col)) {
            return OUT_OF_BOUNDS;
        }
        return satisfiesRegionConditions(row - 1, col, domino[1]);
    }
    else if (direction === LEFT) {
        if (isOutOfBounds(row, col - 1)) {
            return OUT_OF_BOUNDS;
        }
        return satisfiesRegionConditions(row, col - 1, domino[1]);
    }
    else if (direction === RIGHT) {
        if (isOutOfBounds(row, col + 1)) {
            return OUT_OF_BOUNDS;
        }
        return satisfiesRegionConditions(row, col + 1, domino[1]);
    }
    return false;
}

const adjustConditions = (modifications) => {
    for (const modification of modifications) {
        const modificationCellKey = `${modification.cell[0]},${modification.cell[1]}`;
        const regionCondition = indicesToRegion[modificationCellKey];


        if (regionCondition.type === 'sum') {
            regionCondition.indices.forEach(index => {
                const indexKey = `${index[0]},${index[1]}`;
                indicesToRegion[indexKey].target -= modification.value;
                indicesToRegion[indexKey].numberOfCells -= 1;
            })
        }
        else if (regionCondition.type === 'set') {
            regionCondition.indices.forEach(index => {
                const indexKey = `${index[0]},${index[1]}`;
                indicesToRegion[indexKey].target.delete(modification.value);
                indicesToRegion[indexKey].numberOfCells -= 1;
            })
        }
        else if (regionCondition.type === 'less') {
            regionCondition.indices.forEach(index => {
                const indexKey = `${index[0]},${index[1]}`;
                indicesToRegion[indexKey].target -= modification.value;
                indicesToRegion[indexKey].numberOfCells -= 1;
            })
        }
        else if (regionCondition.type === 'greater') {
            regionCondition.indices.forEach(index => {
                const indexKey = `${index[0]},${index[1]}`;
                indicesToRegion[indexKey].target -= modification.value;
                indicesToRegion[indexKey].numberOfCells -= 1;
            })
        }
        else if (regionCondition.type === 'equals') {
            // if you know one value from the equals, then set all of them to be a sum of that single value.
            regionCondition.indices.forEach(index => {
                const indexKey = `${index[0]},${index[1]}`;
                indicesToRegion[indexKey] = { type: 'sum', target: modification.value, numberOfCells: 1 };
                indicesToRegion[indexKey].numberOfCells -= 1;
            })
        }
    }
}

const satisfiesRegionConditions = (row, col, dominoPart) => {
    const regionCondition = indicesToRegion[`${row},${col}`]
    if (regionCondition.type === 'sum') {

        if (regionCondition.numberOfCells === 1)
            return dominoPart === regionCondition.target

        // min value of a cell is (number of cells - 1) * 6 (the value you would need to put if all other cells were maxed)
        // but what if it's two cells that equal to 3, then the min is just 0?
        let minDominoPart = Math.max(0, regionCondition.target - (regionCondition.numberOfCells - 1) * 6);
        // max value of a cell is 6 if there the region cell count is greater than 1.
        // let maxDominoPart = 6;

        return dominoPart >= minDominoPart// && dominoPart <= maxDominoPart;
    }
    else if (regionCondition.type === 'equals') {
        // always return true... if we figured out the value of each cell, then each cell would be a sum to the value
        return true;
    }
    else if (regionCondition.type === 'less') {
        return dominoPart < regionCondition.target;

    }
    else if (regionCondition.type === 'greater') {
        return dominoPart > regionCondition.target;
    }
    else if (regionCondition.type === 'empty') {
        return true;
    }
    else if (regionCondition.type === 'set') {
        return regionCondition.target.has(dominoPart);
    }
}

const isOutOfBounds = (row, col) => {
    return !validIndices.has(`${row},${col}`);
}

// should the region conditions change as you put dominoes down? 
// E.g., should you change the other element in the sum once you put one down? 
// should you change all elements in an equals region to be a sum of the same element if you have one down?
// they should...

const fs = require("fs");

const data = JSON.parse(fs.readFileSync("test.json"));

const dominoes = data.dominoes;
const board = data.regions;

getBoardCoords(board);


console.log(rule_canOnlyBePlacedByOneDomino(dominoes)
    .map(dominoArea => {
        switch (dominoArea.direction) {
            case DOWN:
                dominoArea.direction = "DOWN"
                break;
            case UP:
                dominoArea.direction = "UP"
                break;
            case LEFT:
                dominoArea.direction = "LEFT"
                break;
            case RIGHT:
                dominoArea.direction = "RIGHT"
                break;
        }
        return dominoArea;
    }));

