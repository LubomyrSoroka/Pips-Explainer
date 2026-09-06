
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
let indicesToRegion = {};
let validIndices = new Set();

let dominoPartCounts = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0
}
let initialDominoPartCounts = null;
rowMin = 0;
colMin = 0;
rowMax = 0;
colMax = 0;

let regions = [];
const getBoardCoords = (board) => {
    let previousIndex;
    board.forEach((entry) => {
        previousIndex = null;
        entry.indices.forEach((index) => {
            if (entry.type === 'unequals') {
                entry.type = 'set';
                entry.target = new Set([0, 1, 2, 3, 4, 5, 6]);
            }
            // if (i === 0)
            //     indicesToRegion[index] = { type: entry.type, target: entry.target, indices: entry.indices, numberOfCells: entry.indices.length };
            // else
            //     indicesToRegion[index] = indicesToRegion
            if (!previousIndex) {
                indicesToRegion[index] = { type: entry.type, target: entry.target, indices: entry.indices, numberOfCells: entry.indices.length };
                regions.push(indicesToRegion[index]);
            }
            else
                indicesToRegion[index] = indicesToRegion[previousIndex];


            previousIndex = index;
            validIndices.add(`${index[0]},${index[1]}`);

            rowMin = Math.min(rowMin, index[0]);
            colMin = Math.min(colMin, index[1]);

            rowMax = Math.max(rowMax, index[0]);
            colMax = Math.max(colMax, index[1]);
        });

    })
    dominoes.forEach(domino => {
        dominoPartCounts[domino[0]] += 1;
        dominoPartCounts[domino[1]] += 1;
    })
    initialDominoPartCounts = { ...dominoPartCounts }
    return
}

const DOWN = 'down'
const UP = 'up'
const LEFT = 'left'
const RIGHT = 'right'

const OUT_OF_BOUNDS = 'Out of bounds'
const INVALID_ARRANGEMENT = 'Invalid arrangement'

const canPlaceDomino = () => {
    return dominoes.length > foundDominoes.length;
}
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

let foundDominoes = [];
const rule_canOnlyBePlacedByOneDomino = (dominoes, silenced = false) => {
    const foundAreasAndDominoes = [];
    const possibleDominoPlacements = [];
    const originalConditionsPointer = indicesToRegion;
    const originalRegionsPointer = regions;
    for (let i = rowMin; i <= rowMax; ++i) {
        for (let j = colMin; j <= colMax; ++j) {
            if (isOutOfBounds(i, j))
                continue;
            let validCount = 0;
            let validDomino = null;
            let validDirection = null;
            // need to make a copy this way, since you want a deep copy
            //const originalConditions = JSON.stringify(indicesToRegion);
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
                let flipCount = 2;
                if (domino[0] === domino[1])
                    flipCount = 1
                else if (validDirections.length === 1) {
                    const key = `${i},${j}`;
                    const otherIndices = getOtherIndex([i, j], validDirections[0]);
                    const key2 = otherIndices.join(',');
                    // if (indicesToRegion[key].type === 'sum' || indicesToRegion[key].type === 'set') {

                    if (JSON.stringify(indicesToRegion[key].indices) === JSON.stringify(indicesToRegion[key2].indices) || (indicesToRegion[key].type === 'empty' && indicesToRegion[key2].type === 'empty'))
                        flipCount = 1;
                    //}
                }
                for (let k = 0; k < flipCount; ++k) {
                    indicesToRegion = structuredClone(originalConditionsPointer);
                    regions = structuredClone(originalRegionsPointer);

                    if (!satisfiesRegionConditions(i, j, domino[k]))
                        continue;
                    adjustConditions([{ cell: [i, j], value: domino[k] }])

                    for (const direction of validDirections) {
                        // if there are only two options to consider (like in a corner) and only one of them is possible, then you must place the domino there.
                        let result = check(i, j, domino, direction, k === 1);

                        if (result === true) {
                            validCount++;
                            validDomino = domino;
                            validDirection = direction;
                            validFlipped = k === 1;
                            const dominoEntry = {
                                domino: validDomino,
                                direction: validDirection,
                                flipped: validFlipped
                            }
                            if (possibleDominoPlacements[`${i},${j}`]) {
                                possibleDominoPlacements[`${i},${j}`].push(dominoEntry);
                            } else {
                                possibleDominoPlacements[`${i},${j}`] = [dominoEntry];
                            }
                        }
                        // if (validCount > 1) {
                        //     indicesToRegion = JSON.parse(originalConditions);
                        //     break outerLoop;
                        // }
                    }
                    // revert to a new copy each time.
                    //indicesToRegion = JSON.parse(originalConditions);
                }

            }

            indicesToRegion = originalConditionsPointer;
            regions = originalRegionsPointer;

            // in certain cases, two options will be identical. E.g., if you have a sum with two cells that's blocked on all side, 
            // then if you have a domino which equals that sum any side you flip it is equivalent
            // more generally, if there is only one placement somewhere and it's in a sum, then flipping the domino won't do anything.
            if (possibleDominoPlacements[`${i},${j}`]?.length === 1) {
                let otherIndices = getOtherIndex([i, j], validDirection);
                let [index1, index2] = validFlipped ? [1, 0] : [0, 1];
                adjustConditions([{ cell: [i, j], value: validDomino[index1] }, { cell: otherIndices, value: validDomino[index2] }]);
                // this value is used for checking if something is out of bounds.
                // but it is also used to check if a domino collides with another one.
                validIndices.delete(`${i},${j}`);
                validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);
                dominoEntry = {
                    area: [i, j],
                    domino: validDomino,
                    direction: validDirection,
                    flipped: validFlipped
                }
                if (!silenced)
                    console.log("added domino", dominoEntry)

                foundAreasAndDominoes.push(dominoEntry);
                foundDominoes.push(validDomino);
                //possibleDominoPlacements.push(...possibleDominoPlacementsByArea);
            }
            // is it even necessary to check for the second condition in this or?
            // if nothing is added, would it just be undefined?
            else if (!possibleDominoPlacements[`${i},${j}`] || possibleDominoPlacements[`${i},${j}`].length === 0) {
                return INVALID_ARRANGEMENT;
            }
        }
    }
    if (foundAreasAndDominoes.length > 0)
        return { foundPlacements: foundAreasAndDominoes };
    else
        return { possiblePlacements: possibleDominoPlacements };
}


const getOtherIndex = ([i, j], direction) => {
    switch (direction) {
        case DOWN:
            return [i + 1, j];
        case UP:
            return [i - 1, j];
        case LEFT:
            return [i, j - 1];
        case RIGHT:
            return [i, j + 1];
    }
}


// possibleDominoPlacements is an array of objects: [{ [row, col]: [{ domino: [num1, num2], direction: direction }] }]
const lookAhead = (possibleDominoPlacements) => {
    // start from the area that has the least possibilities.
    const objectToArray = Object.entries(possibleDominoPlacements).sort((a, b) => a[1].length - b[1].length);
    const possibleDominoPlacementsDefinite = [];
    const possibleDominoPlacementsTree = []
    const originalValidIndices = new Set(validIndices);
    const originalFoundDominoes = [...foundDominoes];
    let validOption = null;
    const originalConditionsPointer = indicesToRegion;
    const originalRegionsPointer = regions;
    for (const [cellString, options] of objectToArray) {
        const [row, col] = cellString.split(',');
        const cell = [Number(row), Number(col)];
        for (const option of options) {
            indicesToRegion = structuredClone(originalConditionsPointer);
            regions = structuredClone(originalRegionsPointer);

            const otherIndices = getOtherIndex(cell, option.direction);
            adjustConditions([{ cell: cell, value: option.domino[option.flipped ? 1 : 0] }, { cell: otherIndices, value: option.domino[option.flipped ? 0 : 1] }]);
            validIndices.delete(cellString)
            validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);
            foundDominoes.push(option.domino);

            let result = runRules(true) // if any of the rules fail, then this option must not be possible

            if (result?.foundPlacements) {
                if (!canPlaceDomino()) {
                    const dominoEntry = {
                        area: cell,
                        domino: option.domino,
                        direction: option.direction,
                        flipped: option.flipped
                    }
                    return { foundPlacements: [dominoEntry, ...result?.foundPlacements] };

                }
                validOption = option;
                (possibleDominoPlacementsDefinite[cellString] ??= []).push(result?.foundPlacements);
            }
            else if (result?.possiblePlacements) {
                validOption = option;
                (possibleDominoPlacementsTree[cellString] ??= []).push(result?.possiblePlacements);
            }
            //indicesToRegion = JSON.parse(originalConditions);
            validIndices = new Set(originalValidIndices);
            foundDominoes = [...originalFoundDominoes];
        }

        indicesToRegion = originalConditionsPointer;
        regions = originalRegionsPointer;

        // if there is only one validOption, break, place that domino down and run the rules again.
        if ((possibleDominoPlacementsDefinite[cellString]?.length ?? 0) + (possibleDominoPlacementsTree[cellString]?.length ?? 0) === 1) {

            const dominoEntry = {
                area: cell,
                domino: validOption.domino,
                direction: validOption.direction,
                flipped: validOption.flipped
            }

            foundDominoes.push(validOption.domino);
            const otherIndices = getOtherIndex(cell, validOption.direction);
            validIndices.delete(cellString);
            validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);
            adjustConditions([{ cell: cell, value: validOption.domino[validOption.flipped ? 1 : 0] }, { cell: otherIndices, value: validOption.domino[validOption.flipped ? 0 : 1] }]);

            for (const definite of possibleDominoPlacementsDefinite[cellString] ?? []) {
                for (const dominoEntry of definite.foundPlacements) {
                    foundDominoes.push(dominoEntry.domino);
                    const otherIndex = getOtherIndex(dominoEntry.area, dominoEntry.direction)
                    validIndices.delete(`${dominoEntry.area[0]},${dominoEntry.area[1]}`);
                    validIndices.delete(`${otherIndex[0]},${otherIndex[1]}`);
                    adjustConditions([{ cell: dominoEntry.area, value: dominoEntry.domino[dominoEntry.flipped ? 1 : 0] }, { cell: otherIndex, value: dominoEntry.domino[dominoEntry.flipped ? 0 : 1] }]);
                }
            }

            const result = { foundPlacements: [dominoEntry, ...(possibleDominoPlacementsDefinite[cellString] ?? [])] }
            console.dir(result, { depth: null });
            return result;

        }

        else if ((possibleDominoPlacementsDefinite[cellString]?.length ?? 0) + (possibleDominoPlacementsTree[cellString]?.length ?? 0) === 0) {
            // then if this was called recursively, you know that one scenario that you were considering is incorrect.
            return INVALID_ARRANGEMENT;
        }

    }
}


// checks if it is possible for domino to go into [row, col]. assume that row and col exist in the grid.
// need to use data from current board solve
const check = (row, col, domino, direction, flip) => {
    const dominoValue = flip ? domino[0] : domino[1];
    if (direction === DOWN) {
        if (isOutOfBounds(row + 1, col)) {
            return OUT_OF_BOUNDS;
        }
        // if domino[0] doesn't satisfy these conditions, then return invalid;
        return satisfiesRegionConditions(row + 1, col, dominoValue);
    }
    else if (direction === UP) {
        if (isOutOfBounds(row - 1, col)) {
            return OUT_OF_BOUNDS;
        }
        return satisfiesRegionConditions(row - 1, col, dominoValue);
    }
    else if (direction === LEFT) {
        if (isOutOfBounds(row, col - 1)) {
            return OUT_OF_BOUNDS;
        }
        return satisfiesRegionConditions(row, col - 1, dominoValue);
    }
    else if (direction === RIGHT) {
        if (isOutOfBounds(row, col + 1)) {
            return OUT_OF_BOUNDS;
        }
        return satisfiesRegionConditions(row, col + 1, dominoValue);
    }
    return false;
}


const adjustConditions = (modifications) => {
    for (const modification of modifications) {
        const modificationCellKey = `${modification.cell[0]},${modification.cell[1]}`;
        const regionCondition = indicesToRegion[modificationCellKey];

        if (regionCondition.type === 'sum') {
            // regionCondition.indices.forEach(index => {
            //     const indexKey = `${index[0]},${index[1]}`;
            //     indicesToRegion[indexKey].target -= modification.value;
            //     indicesToRegion[indexKey].numberOfCells -= 1;
            // })
            regionCondition.numberOfCells -= 1;
            regionCondition.target -= modification.value;
        }
        else if (regionCondition.type === 'set') {
            // regionCondition.indices.forEach(index => {
            //     const indexKey = `${index[0]},${index[1]}`;
            //     indicesToRegion[indexKey].target.delete(modification.value);
            //     indicesToRegion[indexKey].numberOfCells -= 1;
            // })
            regionCondition.numberOfCells -= 1;
            regionCondition.target.delete(modification.value);
        }
        else if (regionCondition.type === 'less') {
            // regionCondition.indices.forEach(index => {
            //     const indexKey = `${index[0]},${index[1]}`;
            //     indicesToRegion[indexKey].target -= modification.value;
            //     indicesToRegion[indexKey].numberOfCells -= 1;
            // })
            regionCondition.numberOfCells -= 1;
            regionCondition.target -= modification.value;
        }
        else if (regionCondition.type === 'greater') {
            // regionCondition.indices.forEach(index => {
            //     const indexKey = `${index[0]},${index[1]}`;
            //     indicesToRegion[indexKey].target -= modification.value;
            //     indicesToRegion[indexKey].numberOfCells -= 1;
            // })
            regionCondition.numberOfCells -= 1;
            regionCondition.target -= modification.value;
        }
        else if (regionCondition.type === 'equals') {
            // if you know one value from the equals, then set all of them to be a sum of that single value.
            regionCondition.indices.forEach(index => {
                const indexKey = `${index[0]},${index[1]}`;
                indicesToRegion[indexKey] = { type: 'sum', target: modification.value, numberOfCells: 1, indices: [index] };
                regions.push(indicesToRegion[indexKey]);
            })
            // no need for this because the value would already get replaced.
            //delete indicesToRegion[modificationCellKey];

            regions.splice(regions.indexOf(regionCondition), 1);

        }
    }
}

const updateSumMultipleOfSixAndZeroes = () => {
    for (const [index, entry] of regions.entries()) {
        if (entry.type === 'sum') {
            if (entry.indices.length >= 2 && entry.target > 12 && entry.target % 6 === 0) {
                const replaced = false;
                for (const index of entry.indices) {
                    const indexKey = `${index[0]},${index[1]}`;
                    if (validIndices.has(indexKey)) {
                        replced = true;
                        indicesToRegion[indexKey] = { type: 'sum', target: 6, numberOfCells: 1, indices: [index] }
                        regions.push(indicesToRegion[indexKey]);
                    }
                }
                if (replaced) {
                    regions.splice(index, 1);
                    console.log(`replacing region ${JSON.stringify(entry.indices)} with 6's`)
                }
            }
            else if (entry.indices.length >= 2 && entry.target === 0) {
                const replaced = false;
                for (const index of entry.indices) {
                    const indexKey = `${index[0]},${index[1]}`;
                    if (validIndices.has(indexKey)) {
                        replaced = true;
                        indicesToRegion[indexKey] = { type: 'sum', target: 0, numberOfCells: 1, indices: [index] }
                        regions.push(indicesToRegion[indexKey]);
                    }
                }
                if (replaced) {
                    console.log(`replacing region ${JSON.stringify(entry.indices)} with 0's`)
                    regions.splice(index, 1);
                }
            }
        }
    }
}

const updateEqualsRegions = () => {
    entryLoop: for (const [index, entry] of regions.entries()) {
        if (entry.type === 'equals') {
            const numberOfCells = entry.indices.length;
            let numberOfPossibleValues = 0;
            let validDominoPart = null;
            for (const [dominoPart, count] of Object.entries(dominoPartCounts).map(([key, value]) => [Number(key), value])) {
                if (count >= numberOfCells) {
                    numberOfPossibleValues += 1;
                    validDominoPart = dominoPart;
                }
                if (numberOfPossibleValues > 1) {
                    continue entryLoop;
                }
            }
            if (numberOfPossibleValues === 1) {
                console.log(`replacing region ${JSON.stringify(entry.indices)} with ${validDominoPart}`)
                regions.splice(index, 1);
                for (const index of entry.indices) {
                    const indexKey = `${index[0]},${index[1]}`;
                    indicesToRegion[indexKey] = { type: 'sum', target: validDominoPart, numberOfCells: 1, indices: [index] };
                    regions.push(indicesToRegion[indexKey]);
                }
            }
            else if (numberOfPossibleValues === 0)
                return INVALID_ARRANGEMENT;
        }
    }
}


const updateDominoPartCounts = () => {

    dominoPartCounts = { ...initialDominoPartCounts }
    for (const entry of regions) {
        if (entry.type === 'sum') {
            if (entry.indices.length === 1)
                dominoPartCounts[entry.target] -= 1;
            else if (entry.target > 7 && entry.target % 6 === 1) {// e.g. if it is 11, 17 and so on...
                const sixesToSubtract = Math.trunc(entry.target / 6);
                dominoPartCounts[6] -= sixesToSubtract;
                dominoPartCounts[5] -= 1;
            }
            if (Object.values(dominoPartCounts).some(val => val < 0))
                return INVALID_ARRANGEMENT;
        }
    }


    //console.log(dominoPartCounts);
    return true;
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

        return dominoPart >= minDominoPart && dominoPart <= regionCondition.target;
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

//const data = JSON.parse(fs.readFileSync("test.json")); // Aug 25
const data = JSON.parse(fs.readFileSync("test-equals.json")); // Aug 15
//const data = JSON.parse(fs.readFileSync("test-multiple-of-6.json")); // Aug 24

const dominoes = data.dominoes;
const board = data.regions;


const runRules = (silenced = false) => {
    let result = rule_canOnlyBePlacedByOneDomino(dominoes, silenced);
    if (!result?.foundPlacements && result !== INVALID_ARRANGEMENT) {
        updateSumMultipleOfSixAndZeroes();
        result = updateDominoPartCounts();
        if (result !== INVALID_ARRANGEMENT) {
            updateEqualsRegions();
            result = rule_canOnlyBePlacedByOneDomino(dominoes, silenced);
        }
    }
    return result
}

getBoardCoords(board);

// updateSumMultipleOfSixAndZeroes();
// updateCellCounts();
// updateEqualsRegions();
// runRules()

// first, try to place anything down using the simplest rule.
// if that doesn't work, try updating the equals and then trying to place something down using the simplest rule again.
// if that doesn't work, then try to look ahead and see if that let's you place anything down. 
// if that doesn't work, then need to look further down.


let result = null;
const MAX_ITERATIONS = 100;
let iterations = 0;
while (canPlaceDomino() && iterations++ < MAX_ITERATIONS) {
    result = runRules()
    if (!result?.foundPlacements && result !== INVALID_ARRANGEMENT) {
        // remove the conditions from updating equals if it isn't necessary?
        result = lookAhead(result.possiblePlacements);
    }
    if (result === INVALID_ARRANGEMENT)
        break;
}

console.dir(result, { depth: null });
if (!canPlaceDomino())
    console.log("puzzle solved?")




