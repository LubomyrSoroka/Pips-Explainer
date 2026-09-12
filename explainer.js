
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
let rowMin = 0;
let colMin = 0;
let rowMax = 0;
let colMax = 0;

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

const EASY = 'easy';
const MEDIUM = 'medium';
const HARD = 'hard';

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
            let validFlipped = null;
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
            // I'm not entirely sure about this. The original idea was that this rule should only apply to corners or to places where only one cell could fit.
            // if (validDirections.length > 2)
            //     continue;
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
                    ({ indicesToRegion, regions } = structuredClone({ indicesToRegion: originalConditionsPointer, regions: originalRegionsPointer }));
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
                const dominoEntry = {
                    area: [i, j],
                    domino: validDomino,
                    direction: validDirection,
                    flipped: validFlipped
                }
                if (!silenced) {
                    console.log("Added domino in this position as it is the only one that fits in this cell.")
                    console.log("added domino", dominoEntry)
                }

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
    // if (foundAreasAndDominoes.length > 0)
    //     return { foundPlacements: foundAreasAndDominoes };
    // else
    //     return { possiblePlacements: possibleDominoPlacements };
    return { foundPlacements: foundAreasAndDominoes, possiblePlacements: possibleDominoPlacements };
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


// possibleDominoPlacements is an array of objects: [{ [row, col]: [{ domino: [num1, num2], direction: direction, flipped: boolean }] }]
const lookAhead = (possibleDominoPlacements) => {
    // start from the area that has the least possibilities.
    const objectToArray = Object.entries(possibleDominoPlacements).sort((a, b) => a[1].length - b[1].length);
    const placementsByCell = [];
    let stuffToPush = [];
    const originalValidIndices = new Set(validIndices);
    const originalFoundDominoes = [...foundDominoes];
    let validOption = null;
    const originalConditionsPointer = indicesToRegion;
    const originalRegionsPointer = regions;
    for (let i = 0; i < objectToArray.length; ++i) {
        // cellString is an array of "row, col" strings. The entries before the last have already been tried.
        // options is an array of the option chosen at each prevoius cell.

        const cellString = objectToArray[i][0];
        const prevData = objectToArray[i][1];


        ({ indicesToRegion, regions } = structuredClone({ indicesToRegion: originalConditionsPointer, regions: originalRegionsPointer }));
        validIndices = new Set(originalValidIndices);
        foundDominoes = [...originalFoundDominoes]
        let options = null;
        if (prevData?.previous) {
            for (const definitePlacement of prevData.foundPlacements) {

                // need to make a function which wraps this stuff together.
                foundDominoes.push(definitePlacement.domino);
                const otherIndex = getOtherIndex(definitePlacement.area, definitePlacement.direction)
                validIndices.delete(`${definitePlacement.area[0]},${definitePlacement.area[1]}`);
                validIndices.delete(`${otherIndex[0]},${otherIndex[1]}`);
                adjustConditions([{ cell: definitePlacement.area, value: definitePlacement.domino[definitePlacement.flipped ? 1 : 0] }, { cell: otherIndex, value: definitePlacement.domino[definitePlacement.flipped ? 0 : 1] }]);

            }
            options = prevData.possiblePlacements;
            for (let j = 0; j < prevData.previous.length; ++j) {
                // something isn't clear about whther cellString[j] is an array or a string
                const otherIndex = getOtherIndex(prevData.previous[j].cell, prevData.previous[j].direction);
                adjustConditions([{ cell: prevData.previous[j].cell, value: prevData.previous[j].domino[prevData.previous[j].flipped ? 1 : 0] }, { cell: otherIndex, value: prevData.previous[j].domino[prevData.previous[j].flipped ? 0 : 1] }]);
                validIndices.delete(`${prevData.previous[j].cell[0]},${prevData.previous[j].cell[1]}`)
                validIndices.delete(`${otherIndex[0]},${otherIndex[1]}`)
                foundDominoes.push(prevData.previous[j].domino)
            }
        }
        else {
            options = prevData;
        }


        const { savedIndicesToRegion, savedRegions } = structuredClone({ savedIndicesToRegion: indicesToRegion, savedRegions: regions });
        const savedValidIndices = new Set(validIndices);
        const savedFoundDominoes = [...foundDominoes]

        const [row, col] = cellString.split(',');
        const cell = [Number(row), Number(col)];
        let lastValidPlacement = null;
        let validPlacementCount = 0;

        // e.g., cell 0,0 has 3 possiblities
        const cellPossibilityCounts = {};

        // but only one is valid.
        const cellValidCounts = {}

        for (const option of options) {

            ({ indicesToRegion, regions } = structuredClone({ indicesToRegion: savedIndicesToRegion, regions: savedRegions }));
            validIndices = new Set(savedValidIndices);
            foundDominoes = [...savedFoundDominoes];

            const otherIndices = getOtherIndex(cell, option.direction);
            adjustConditions([{ cell: cell, value: option.domino[option.flipped ? 1 : 0] }, { cell: otherIndices, value: option.domino[option.flipped ? 0 : 1] }]);
            validIndices.delete(cellString)
            validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);
            foundDominoes.push(option.domino);

            let result = runRules(true) // if any of the rules fail, then this option must not be possible
            if (result === INVALID_ARRANGEMENT)
                continue;

            if (result?.foundPlacements) {
                if (!canPlaceDomino()) {
                    if (prevData?.previous) {
                        console.log(`${prevData.previous.length} depth search performed`);
                        console.dir(prevData.previous, { depth: null });
                        console.dir(prevData.foundPlacements, { depth: null });
                    }
                    const dominoEntry = {
                        area: cell,
                        domino: option.domino,
                        direction: option.direction,
                        flipped: option.flipped
                    }
                    return { foundPlacements: [dominoEntry, ...result?.foundPlacements] };
                }
                validOption = option;
                // if (prevData?.previous)
                //     (definitePlacements[cellString] ??= []).push({ previous: [...prevData.previous, { cell, ...option }], foundPlacements: result?.foundPlacements });
                // else
                //     (definitePlacements[cellString] ??= []).push({ previous: [{ cell, ...option }], foundPlacements: result?.foundPlacements });
            }
            // else if (result?.possiblePlacements) {
            //     validOption = option;
            //     if (prevData?.previous)
            //         (possiblePlacements[cellString] ??= []).push({ previous: [...prevData.previous, { cell, ...option }], possiblePlacements: result?.possiblePlacements });
            //     else
            //         (possiblePlacements[cellString] ??= []).push({ previous: [{ cell, ...option }], possiblePlacements: result?.possiblePlacements });
            // }

            placementsByCell[cellString] ??= {};
            stuffToPush = [];
            //const foundPlacementsArray = Object.entries(result.foundPlacements);
            //const possiblePlacementsArray = Object.entries(result.possiblePlacements).sort((a, b) => a[1].length - b[1].length)

            // if only one has definite placements, then the idea is that you should put down the definite placements
            // and rerun it to find more definite placements. But it would be better if when you receive the definite placements,
            // it's guaranteed that there are no more such placements.
            if (result !== INVALID_ARRANGEMENT) {
                lastValidPlacement = result;
                ++validPlacementCount;
            }

            // THIS IS SO INEFFICIENT
            if (prevData?.previous)
                //placementsByCell[cellString].push({ previous: [...prevData?.previous, { cell, ...option }], possiblePlacements: result.possiblePlacements, foundPlacements: result.foundPlacements });
                for (const [cellString, entries] of Object.entries(result?.possiblePlacements).sort((a, b) => a[1].length - b[1].length))
                    stuffToPush.push([cellString, { previous: [...prevData?.previous, { cell, ...option }], possiblePlacements: entries, foundPlacements: result?.foundPlacements }]);
            else
                //placementsByCell[cellString].push({ previous: [{ cell, ...option }], possiblePlacements: result.possiblePlacements, foundPlacements: result.foundPlacements });
                for (const [cellString, entries] of Object.entries(result?.possiblePlacements).sort((a, b) => a[1].length - b[1].length))
                    stuffToPush.push([cellString, { previous: [{ cell, ...option }], possiblePlacements: entries, foundPlacements: result?.foundPlacements }]);

            // this is done at the start now.
            //indicesToRegion = JSON.parse(originalConditions);
            // validIndices = new Set(originalValidIndices);
            // foundDominoes = [...originalFoundDominoes];
        }

        indicesToRegion = originalConditionsPointer;
        regions = originalRegionsPointer;
        validIndices = new Set(originalValidIndices);
        foundDominoes = [...originalFoundDominoes];

        // if you've previously placed a domino, then this doesn't work. 
        // so do you just check for that? 
        // in the case of checking possibilities of two dominoes, you would need to check that only one of all possibilites works (then you can place it).
        // number of possibilities = ?
        if (validPlacementCount === 1 && !prevData?.previous) {
            const dominoEntry = {
                area: cell,
                domino: validOption.domino,
                direction: validOption.direction,
                flipped: validOption.flipped
            }

            console.log(`Added domino because all other possibilities yield invalid configurations at cell ${cellString}`)
            console.dir(dominoEntry, { depth: null });
            foundDominoes.push(validOption.domino);
            const otherIndices = getOtherIndex(cell, validOption.direction);
            validIndices.delete(cellString);
            validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);
            adjustConditions([{ cell: cell, value: validOption.domino[validOption.flipped ? 1 : 0] }, { cell: otherIndices, value: validOption.domino[validOption.flipped ? 0 : 1] }]);

            if (lastValidPlacement.foundPlacements.length > 0) {
                console.log("Added domino in this position as it is the only one that fits in this cell.")
                console.dir(lastValidPlacement.foundPlacements, { depth: null });
                for (const dominoEntry of lastValidPlacement.foundPlacements) {
                    foundDominoes.push(dominoEntry.domino);
                    const otherIndex = getOtherIndex(dominoEntry.area, dominoEntry.direction)
                    validIndices.delete(`${dominoEntry.area[0]},${dominoEntry.area[1]}`);
                    validIndices.delete(`${otherIndex[0]},${otherIndex[1]}`);
                    adjustConditions([{ cell: dominoEntry.area, value: dominoEntry.domino[dominoEntry.flipped ? 1 : 0] }, { cell: otherIndex, value: dominoEntry.domino[dominoEntry.flipped ? 0 : 1] }]);
                }
            }

            const result = { foundPlacements: [dominoEntry, ...lastValidPlacement.foundPlacements] }
            return result;

        }
        else if (validPlacementCount === 0)
            // then if this was called recursively, you know that one scenario that you were considering is incorrect.
            // return INVALID_ARRANGEMENT;
            // then this case isn't possible.
            continue;

        // instead of sorting them here, could just push them in a way which maintains sorted order?
        //const toAppend = Object.entries(placementsByCell).sort((a, b) => a[1].possiblePlacements?.length - b[1].possiblePlacements?.length);
        // ALSO NEED TO SORT THE DEFINITE PLACEMENTS

        stuffToPush.sort((a, b) => a[1].possiblePlacements?.length - b[1].possiblePlacements?.length);
        objectToArray.push(...stuffToPush);
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

            indicesToRegion[modificationCellKey].target = 0;
            indicesToRegion[modificationCellKey].numberOfCells = 0;

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
                let replaced = false;
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
            let validDominoParts = new Set();
            for (const [dominoPart, count] of Object.entries(dominoPartCounts).map(([key, value]) => [Number(key), value])) {
                if (count >= numberOfCells) {
                    numberOfPossibleValues += 1;
                    validDominoParts.add(dominoPart);
                }
                // if (numberOfPossibleValues > 1) {
                //     continue entryLoop;
                // }
            }
            if (numberOfPossibleValues === 1) {
                console.log(`replacing region ${JSON.stringify(entry.indices)} with ${validDominoParts.values().next().value}`)
                regions.splice(index, 1);
                for (const index of entry.indices) {
                    const indexKey = `${index[0]},${index[1]}`;
                    indicesToRegion[indexKey] = { type: 'sum', target: validDominoParts.values().next().value, numberOfCells: 1, indices: [index] };
                    regions.push(indicesToRegion[indexKey]);
                }
            }
            else if (numberOfPossibleValues > 1) {
                for (const index of entry.indices) {
                    const indexKey = `${index[0]},${index[1]}`;
                    indicesToRegion[indexKey].target = validDominoParts;
                }
            }
            else if (numberOfPossibleValues === 0)
                return INVALID_ARRANGEMENT;
        }
    }
}


const updateDominoPartCounts = () => {
    dominoPartCounts = { ...initialDominoPartCounts }
    for (const domino of foundDominoes) {
        dominoPartCounts[domino[0]] -= 1;
        dominoPartCounts[domino[1]] -= 1;
    }
    for (const entry of regions) {
        if (entry.type === 'sum') {
            // the reason for checking if the index is in validIndices (the indices of the cells which haven't been assigned any domnino yet)
            // is because when you add a domino there, the sum will go to 0 and which will subtract from the number of 0's
            // and then you will get an invalid configuration because the number of 0 is below 0 (which isn't really true.)
            if (entry.indices.length === 1 && validIndices.has(entry.indices[0].join(',')))
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

        // to improve this, you can find the max that you can create with your current domino configuration.
        // If you are missing or need to use some 6's, it could be different from what is currently calculated.

        let minDominoPart = Math.max(0, regionCondition.target - (regionCondition.numberOfCells - 1) * 6);
        // max value of a cell is 6 if there the region cell count is greater than 1.
        // let maxDominoPart = 6;

        return dominoPart >= minDominoPart && dominoPart <= regionCondition.target;
    }
    else if (regionCondition.type === 'equals') {
        // if we have determined that there are only certain values that the equals can contain, then check if this value is one of them.
        // e.g. if you have an equals region with 4 cells, but you have 4 0's and 5 1's and less than 4 everything else, it must be either 4 or 5.
        if (regionCondition.target) {
            return regionCondition.target.has(dominoPart);
        }
        return true;
    }
    else if (regionCondition.type === 'less') {
        // if there is more than one cell, is there some special case to consider?
        return dominoPart < regionCondition.target;
    }
    else if (regionCondition.type === 'greater') {
        if (regionCondition.numberOfCells === 1)
            return dominoPart > regionCondition.target;
        let minDominoPart = Math.max(0, regionCondition.target + 1 - (regionCondition.numberOfCells - 1) * 6);

        return dominoPart >= minDominoPart && dominoPart <= regionCondition.target;

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


// test puzzles:
// Aug 25, 2026 easy // requires trying one of more than one possibility to finish the puzzle.
// Aug 15, 2026 easy // requires one look ahead
// Aug 24, 2026 easy // no looking ahead
// Aug 17, 2026 Medium

const date = new Date('2026-08-17T00:00:00Z'); // leave the part after T to ensure that this is in UTC. That way when converting the date to string, it doesn't change based on your timezone.
const difficulty = MEDIUM;
const allData = await fetch(`https://www.nytimes.com/svc/pips/v1/${date.toISOString().split('T')[0]}.json`, {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/[IP_ADDRESS] Safari/537.36'
    }
});

const json = await allData.json();

if (difficulty !== EASY && difficulty !== MEDIUM && difficulty !== HARD)
    throw new Error(`difficulty ${difficulty} is not valid`);

const data = json[difficulty];


const dominoes = data.dominoes;
const board = data.regions;


const runRules = (silenced = false) => {
    let result = rule_canOnlyBePlacedByOneDomino(dominoes, silenced);
    if (result?.foundPlacements && result.foundPlacements.length === 0) {
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
    //if (!(result?.foundPlacements || result.foundPlacements.length === 1) && result !== INVALID_ARRANGEMENT) {
    if (result?.foundPlacements && result.foundPlacements.length === 0) {
        // remove the conditions from updating equals if it isn't necessary?
        result = lookAhead(result.possiblePlacements);
    }
    if (result === INVALID_ARRANGEMENT)
        break;
}

console.dir(result, { depth: null });
if (!canPlaceDomino())
    console.log("puzzle solved?")




