
export let finalSolution;
export let invalidRoots;
export let done;
export let initialDominoPartCounts;
export let dominoes;
export let board;
export let cellsToDirections;
export let dominoPartCounts;
export let oneDirectionFromDominoEliminationCells = new Set();
//export let dominoPartCountHistory;

export const DOWN = 'down'
export const UP = 'up'
export const LEFT = 'left'
export const RIGHT = 'right'

export const getOtherIndex = ([i, j], direction) => {
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

import { getCombinations, removeCombinations } from "./GetCombinations.js";
import { updateCombinations } from "./GetCombinations.js";


export let validIndices = new Set();

export const setValidIndices = (newValidIndices) => {
    validIndices = newValidIndices;
}

import { rule_canOnlyBePlacedInOneArea } from "./canOnlyBePlacedInOneArea.js";

export const copyIndicesAndRegions = (originalConditionsPointer, originalRegionsPointer) => {
    ({ indicesToRegion, regions } = structuredClone({ indicesToRegion: originalConditionsPointer, regions: originalRegionsPointer }));
}

export const resetIndicesAndRegions = (originalConditionsPointer, originalRegionsPointer) => {
    indicesToRegion = originalConditionsPointer;
    regions = originalRegionsPointer;
}

export const adjustConditions = (modifications) => {
    for (const modification of modifications) {
        const modificationCellKey = `${modification.cell[0]},${modification.cell[1]}`;
        const regionCondition = indicesToRegion[modificationCellKey];

        const index = regionCondition.indices.map(index => `${index[0]},${index[1]}`).indexOf(modificationCellKey);
        if (index !== -1) {
            regionCondition.indices.splice(index, 1);
        }

        if (regionCondition.type === 'sum') {
            regionCondition.numberOfCells -= 1;
            regionCondition.target -= modification.value;
            const result = updateCombinations(regionCondition.combinations, modification.value);
            if (result) {
                const { unusedPipsValues, combinations } = result;
                regionCondition.unusedPipsValues = unusedPipsValues;
                regionCondition.combinations = combinations;
            }
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
            const result = updateCombinations(regionCondition.combinations, modification.value);
            if (result) {
                const { unusedPipsValues, combinations } = result;
                regionCondition.unusedPipsValues = unusedPipsValues;
                regionCondition.combinations = combinations;
            }
        }
        else if (regionCondition.type === 'greater') {
            // regionCondition.indices.forEach(index => {
            //     const indexKey = `${index[0]},${index[1]}`;
            //     indicesToRegion[indexKey].target -= modification.value;
            //     indicesToRegion[indexKey].numberOfCells -= 1;
            // })
            regionCondition.numberOfCells -= 1;
            regionCondition.target -= modification.value;
            const result = updateCombinations(regionCondition.combinations, modification.value);
            if (result) {
                const { unusedPipsValues, combinations } = result;
                regionCondition.unusedPipsValues = unusedPipsValues;
                regionCondition.combinations = combinations;
            }
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

export const check = (row, col, domino, direction, flip) => {
    const dominoValue = flip ? domino[0] : domino[1];
    if (direction === DOWN) {
        if (isOutOfBoundsOrFilled(row + 1, col)) {
            return OUT_OF_BOUNDS;
        }
        // if domino[0] doesn't satisfy these conditions, then return invalid;
        return satisfiesRegionConditions(row + 1, col, dominoValue);
    }
    else if (direction === UP) {
        if (isOutOfBoundsOrFilled(row - 1, col)) {
            return OUT_OF_BOUNDS;
        }
        return satisfiesRegionConditions(row - 1, col, dominoValue);
    }
    else if (direction === LEFT) {
        if (isOutOfBoundsOrFilled(row, col - 1)) {
            return OUT_OF_BOUNDS;
        }
        return satisfiesRegionConditions(row, col - 1, dominoValue);
    }
    else if (direction === RIGHT) {
        if (isOutOfBoundsOrFilled(row, col + 1)) {
            return OUT_OF_BOUNDS;
        }
        return satisfiesRegionConditions(row, col + 1, dominoValue);
    }
    return false;
}

export const satisfiesRegionConditions = (row, col, dominoPart) => {
    const regionCondition = indicesToRegion[`${row},${col}`]
    if (regionCondition.type === 'sum') {

        if (regionCondition.numberOfCells === 1)
            return dominoPart === regionCondition.target

        // min value of a cell is (number of cells - 1) * 6 (the value you would need to put if all other cells were maxed)
        // but what if it's two cells that equal to 3, then the min is just 0?
        // to improve this, you can find the max that you can create with your current domino configuration.
        // If you are missing or need to use some 6's, it could be different from what is currently calculated.
        // let minDominoPart = Math.max(0, regionCondition.target - (regionCondition.numberOfCells - 1) * 6);
        // max value of a cell is 6 if there the region cell count is greater than 1.
        // let maxDominoPart = 6;

        // return dominoPart >= minDominoPart && dominoPart <= regionCondition.target;

        // e.g., if a cell is a region of 2 which sums to 12, then both are 6 so everything apart from 6 in unusedPipsValues.
        return !regionCondition.unusedPipsValues.has(dominoPart);
    }
    else if (regionCondition.type === 'equals') {
        // if we have determined that there are only certain values that the equals can contain, then check if this value is one of them.
        // e.g. if you have an equals region with 4 cells, but you have 4 0's and 5 1's and less than 4 everything else, it must be either 4 or 5.
        if (regionCondition?.requiresDouble) {
            if (!hasDouble[dominoPart])
                return false
        }
        if (regionCondition.target) {
            return regionCondition.target.has(dominoPart);
        }
        return true;
    }
    else if (regionCondition.type === 'less') {
        // if there is more than one cell, is there some special case to consider?
        // return dominoPart < regionCondition.target;

        // how is this different from just returning what's above? 
        // An example: if you have one zeros and you have a less than 3 in 3 cells, then if you add a two in one cell, there would be no way of completing the other two.
        // so (2, 0, 0) wouldn't be a valid combination and 2 could even be an invalid domino part to use here.
        if (regionCondition.numberOfCells === 1)
            return dominoPart < regionCondition.target;
        return !regionCondition.unusedPipsValues.has(dominoPart);
    }
    else if (regionCondition.type === 'greater') {
        if (regionCondition.numberOfCells === 1)
            return dominoPart > regionCondition.target;

        // let minDominoPart = Math.max(0, regionCondition.target + 1 - (regionCondition.numberOfCells - 1) * 6);
        // return dominoPart >= minDominoPart && dominoPart <= regionCondition.target;
        return !regionCondition.unusedPipsValues.has(dominoPart);
    }
    else if (regionCondition.type === 'empty') {
        return true;
    }
    else if (regionCondition.type === 'set') {
        return regionCondition.target.has(dominoPart);
    }
}

export let validCellsToDirections = new Map();
let indicesToRegion = {};

//dominoPartCountHistory = [];
cellsToDirections = [];
finalSolution = [];
invalidRoots = new Map();
done = false;
initialDominoPartCounts = null;

validIndices = new Set();


const hasDouble = {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
}

dominoPartCounts = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0
}
let rowMin = 0;
let colMin = 0;
let rowMax = 0;
let colMax = 0;

export let regions = [];
const getBoardCoords = (board) => {
    let previousIndex;

    const boardCopy = structuredClone(board);
    boardCopy.forEach((entry) => {
        previousIndex = null;
        entry.indices.forEach((index) => {
            if (entry.type === 'unequal') {
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
        if (domino[0] === domino[1])
            hasDouble[domino[0]] = true;
    })
    initialDominoPartCounts = { ...dominoPartCounts }
    return
}

const checkRequiresDouble = () => {
    for (const region of regions) {
        if (region.type === 'equals') {
            checkRequiresDoubleOuterLoop: for (const [i, j] of region.indices) {
                const validDirections = validCellsToDirections.get(`${i},${j}`);
                if (!validDirections)
                    continue;

                for (const validDirection of validDirections) {
                    const otherIndex = getOtherIndex([i, j], validDirection);
                    // if the other index is outside of the region
                    if (!region.indices.map(index => `${index[0]},${index[1]}`).includes(`${otherIndex[0]},${otherIndex[1]}`))
                        continue checkRequiresDoubleOuterLoop; // then this is not a cell such that all directions are within the region.
                }
                region.requiresDouble = true;
                break;
            }
        }
    }
}



const OUT_OF_BOUNDS = 'Out of bounds'
export const INVALID_ARRANGEMENT = 'Invalid arrangement'

const EASY = 'easy';
const MEDIUM = 'medium';
const HARD = 'hard';


const canPlaceDomino = () => {
    return dominoes.length > foundDominoes.length;
}

// map from each cell to the directions that this cell can take
let cellCoordinatesToIgnore = new Set();
let updatedStructureOnce = false;
let willBePlaced = new Set();

export const updateStructure = (silenced = false) => {
    // find all placements which can only take one value.
    // put a fake domino there and repeat this process until you can't find any more guaranteed placemnets or have no more dominoes to fill on the board.

    oneDirectionFromDominoEliminationCells = new Set();
    const func = () => {
        let hasOneDirectionCell = false;
        do {
            hasOneDirectionCell = false;
            const originalConditionsPointer = indicesToRegion;
            const originalRegionsPointer = regions;
            for (const [i, j] of Array.from(validIndices).map(indices => indices.split(',').map(Number))) {
                if (updatedStructureOnce && (!validCellsToDirections.get(`${i},${j}`) || validCellsToDirections.get(`${i},${j}`).length === 1)) {
                    continue;
                }
                if (cellCoordinatesToIgnore.has(`${i},${j}`)) {
                    continue;
                }
                const additions = [[DOWN, 1, 0], [UP, -1, 0], [LEFT, 0, -1], [RIGHT, 0, 1]]
                let otherIndex = null;
                const otherIndices = [];
                const validDirections = [];
                let validOtherIndex = null;
                let hasInvalidatedDirectionFromDominoes = false;

                for (const [direction, deltaRow, deltaCol] of additions) {
                    otherIndex = [i + deltaRow, j + deltaCol];
                    if (isOutOfBoundsOrFilled(i + deltaRow, j + deltaCol) || willBePlaced.has(`${i + deltaRow},${j + deltaCol}`))
                        //if (isOutOfBoundsOrFilled(i + deltaRow, j + deltaCol))
                        continue;
                    let hasValid = false;

                    outerDominoLoop: for (const domino of dominoes) {
                        if (foundDominoes.some(foundDomino => foundDomino[0] === domino[0] && foundDomino[1] === domino[1]))
                            continue;
                        //------------------------------------------------------------------------------------------------------------------------------------------------------
                        for (const flip of [0, 1]) {
                            ({ indicesToRegion, regions } = structuredClone({ indicesToRegion: originalConditionsPointer, regions: originalRegionsPointer }));
                            if (!satisfiesRegionConditions(i, j, flip ? domino[1] : domino[0]))
                                continue;
                            adjustConditions([{ cell: [i, j], value: domino[flip ? 1 : 0] }]);
                            hasValid = check(i, j, domino, direction, flip);
                            indicesToRegion = originalConditionsPointer;
                            regions = originalRegionsPointer;
                            if (hasValid)
                                break outerDominoLoop;
                            //------------------------------------------------------------------------------------------------------------------------------------------------------
                        }
                    }
                    if (hasValid) {
                        validOtherIndex = [...otherIndex];
                        validDirections.push(direction);
                        otherIndices.push(otherIndex);
                    }
                    else {
                        hasInvalidatedDirectionFromDominoes = true;
                    }
                }

                if (validDirections.length === 1) {
                    validIndices.delete(`${i},${j}`)
                    validIndices.delete(`${validOtherIndex[0]},${validOtherIndex[1]}`)
                    willBePlaced.add(`${i},${j}`);
                    willBePlaced.add(`${validOtherIndex[0]},${validOtherIndex[1]}`);
                    validCellsToDirections.delete(`${validOtherIndex[0]},${validOtherIndex[1]}`)
                    hasOneDirectionCell = true;
                    cellCoordinatesToIgnore.add(`${validOtherIndex[0]},${validOtherIndex[1]}`);
                    if (hasInvalidatedDirectionFromDominoes) {
                        oneDirectionFromDominoEliminationCells.add(`${i},${j}`)
                    }
                }
                else if (validDirections.length === 0) {
                    return INVALID_ARRANGEMENT;
                }
                validCellsToDirections.set(`${i},${j}`, validDirections);
            }
        } while (hasOneDirectionCell);
    }
    const originalValidIndices = new Set(validIndices);
    func();

    //const singlePlacementCells = Array.from(validCellsToDirections.entries()).filter(([cell, directions]) => directions.length === 1);
    //finalSolution.push({ dominoEntry: null, reasoning: null, singlePlacementCells, additionalCellsThatGiveStructure: null, oneDirectionFromDominoEliminationCells })

    // This is used in October 5, 2026 Hard for example
    updatedStructureOnce = true;
    nextCellForCellsInCommon: for (const [i, j] of Array.from(validCellsToDirections.keys()).map(indices => indices.split(',').map(Number))) {
        // or maybe setting the direction to the final direction when you set a domino down could also work.
        if (!validIndices.has(`${i},${j}`)) {
            continue;
        }
        const directions = validCellsToDirections.get(`${i},${j}`);
        if (!directions || directions.length === 1)
            continue;
        let singlePossibilityCellsInCommon = null;
        const originalValidIndices = new Set(validIndices);
        directionLoop: for (const direction of directions) {
            validIndices.delete(`${i},${j}`);
            const otherIndex = getOtherIndex([i, j], direction);
            validIndices.delete(`${otherIndex[0]},${otherIndex[1]}`);
            const originalValidCellsToDirections = structuredClone(validCellsToDirections);
            const originalCellCoordinatesToIgnore = new Set(cellCoordinatesToIgnore);
            const originalOneDirectionFromDominoEliminationCells = new Set(oneDirectionFromDominoEliminationCells);
            const originalSinglePossibilityCellsKeys = new Set(Array.from(validCellsToDirections.entries()).filter(([cell, directions]) => directions.length === 1).map(([cell, directions]) => cell));
            const originalWillBePlaced = new Set(willBePlaced);
            validCellsToDirections.set(`${i},${j}`, [direction])
            validCellsToDirections.delete(`${otherIndex[0]},${otherIndex[1]}`);
            cellCoordinatesToIgnore.add(`${otherIndex[0]},${otherIndex[1]}`);
            const result = func();
            willBePlaced = originalWillBePlaced;
            oneDirectionFromDominoEliminationCells = originalOneDirectionFromDominoEliminationCells;
            validIndices = new Set(originalValidIndices);
            cellCoordinatesToIgnore = originalCellCoordinatesToIgnore;

            // what this can check is that if all directions but one lead to an invalid arragement, then you know what the orientation of the domino should be.
            // but how is this different from the validDirection.length === 1 check?
            if (result === INVALID_ARRANGEMENT) {
                validCellsToDirections = originalValidCellsToDirections;
                continue directionLoop;
            }
            const newSinglePossibilityCells = new Map(Array.from(validCellsToDirections.entries()).filter(([cell, directions]) => directions.length === 1 && !originalSinglePossibilityCellsKeys.has(cell)));
            validCellsToDirections = originalValidCellsToDirections;
            if (!singlePossibilityCellsInCommon) {
                singlePossibilityCellsInCommon = newSinglePossibilityCells;
            } else {
                singlePossibilityCellsInCommon = new Map(Array.from(newSinglePossibilityCells.entries()).filter(([cell, directions]) => singlePossibilityCellsInCommon.has(cell) && JSON.stringify(singlePossibilityCellsInCommon.get(cell)) === JSON.stringify(directions)));
                if (singlePossibilityCellsInCommon.size === 0) {
                    continue nextCellForCellsInCommon;
                }
            }
        }
        for (const [cell, directions] of singlePossibilityCellsInCommon ?? []) {
            validCellsToDirections.set(cell, directions);
            validIndices.delete(cell);
            const otherIndex = getOtherIndex(cell.split(',').map(Number), directions[0]);
            validCellsToDirections.delete(otherIndex.join(','));
            cellCoordinatesToIgnore.add(otherIndex.join(','));
            validIndices.delete(`${otherIndex[0]},${otherIndex[1]}`);
        }
        if (singlePossibilityCellsInCommon && singlePossibilityCellsInCommon.size > 0 && !silenced) {
            finalSolution.push({ dominoEntry: undefined, reasoning: `Altered structure due to all directions implying same structure at cell ${i},${j}`, singlePlacementCells: Array.from(singlePossibilityCellsInCommon.entries()), additionalCellsThatGiveStructure: [i, j], oneDirectionFromDominoEliminationCells })
        }
    }
    getNoRepeatDirections();
    // valid indices represents the cells that are not filled in and not out of bounds.
    validIndices = originalValidIndices;
}


export let noRepeatPossibleDominoPlacements = null;

const oppositeDirection = (direction) => {
    switch (direction) {
        case DOWN:
            return UP;
        case UP:
            return DOWN;
        case RIGHT:
            return LEFT;
        case LEFT:
            return RIGHT;
    }
}
const getNoRepeatDirections = () => {
    noRepeatPossibleDominoPlacements = structuredClone(validCellsToDirections);
    for (const [cell, directions] of Array.from(noRepeatPossibleDominoPlacements.entries())) {
        for (const direction of directions) {
            const otherIndex = getOtherIndex(cell.split(',').map(Number), direction);
            const otherDirections = noRepeatPossibleDominoPlacements.get(otherIndex.join(','))
            if (otherDirections) {
                const index = otherDirections.indexOf(oppositeDirection(direction));
                if (index !== -1) {
                    otherDirections.splice(index, 1);
                    if (otherDirections.length === 0)
                        noRepeatPossibleDominoPlacements.delete(otherIndex.join(','));
                }
            }
        }
    }
}

const reasoningOnlyOneDomino = "Added domino in this position through rule_canOnlyBePlacedByOneDomino";
export let foundDominoes = [];
const rule_canOnlyBePlacedByOneDomino = (dominoes, silenced = false) => {
    const foundAreasAndDominoes = [];
    let possibleDominoPlacementsSmallest = [];
    let possibleDominoPlacementsCurrent = [];

    const originalConditionsPointer = indicesToRegion;
    const originalRegionsPointer = regions;
    const originalValidCellsToDirectionsValue = new Map(validCellsToDirections);
    let minPossiblePlacementsCount = Infinity;

    nextCell: for (const [i, j] of Array.from(validCellsToDirections.keys()).map(key => key.split(',').map(Number))) {
        // this should check that you aren't placing the domino on a cell that already has a domino on it (not really checking that you're placing something out of bounds) 
        if (!validCellsToDirections.get(`${i},${j}`) || isOutOfBoundsOrFilled(i, j))
            continue;

        let validCount = 0;
        let validDomino = null;
        let validDirection = null;
        let validFlipped = null;
        possibleDominoPlacementsCurrent = [];
        const validDirections = validCellsToDirections.get(`${i},${j}`);

        outerLoop: for (const domino of dominoes) {
            // this doesn't account for the case where you have the same domino twice (rare)

            // this should use a set with strings instead.
            if (foundDominoes.some(foundDomino => foundDomino[0] === domino[0] && foundDomino[1] === domino[1]))
                continue;
            let flipCount = 2;
            if (domino[0] === domino[1])
                flipCount = 1
            else if (validDirections.length === 1) {
                const key = `${i},${j}`;
                const otherIndices = getOtherIndex([i, j], validDirections[0]);
                const key2 = otherIndices.join(',');

                // should be able to get rid of the JSON.stringify here
                if (JSON.stringify(indicesToRegion[key].indices) === JSON.stringify(indicesToRegion[key2].indices) || (indicesToRegion[key].type === 'empty' && indicesToRegion[key2].type === 'empty'))
                    flipCount = 1;
            }
            //------------------------------------------------------------------------------------------------------------------------------------------------------
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
                        if (validCount > minPossiblePlacementsCount)
                            continue nextCell;
                        validDomino = domino;
                        validDirection = direction;
                        validFlipped = k === 1;
                        const dominoEntry = {
                            cell: [i, j],
                            domino: validDomino,
                            direction: validDirection,
                            flipped: validFlipped
                        }
                        possibleDominoPlacementsCurrent.push(dominoEntry);
                        //------------------------------------------------------------------------------------------------------------------------------------------------------
                    }
                }
            }
        }

        // if you got here, then you didn't skip to the next cell in the grid because of too many possiblities.
        if (validCount !== 1) {
            minPossiblePlacementsCount = validCount;
            possibleDominoPlacementsSmallest = [...possibleDominoPlacementsCurrent];
        }


        // in certain cases, two options will be identical. E.g., if you have a sum with two cells that's blocked on all side, 
        // then if you have a domino which equals that sum any side you flip it is equivalent
        // more generally, if there is only one placement somewhere and it's in a sum, then flipping the domino won't do anything.
        if (validCount === 1) {
            indicesToRegion = originalConditionsPointer;
            regions = originalRegionsPointer;
            let otherIndices = getOtherIndex([i, j], validDirection);
            let [index1, index2] = validFlipped ? [1, 0] : [0, 1];
            adjustConditions([{ cell: [i, j], value: validDomino[index1] }, { cell: otherIndices, value: validDomino[index2] }]);
            // this value is used for checking if something is out of bounds.
            // but it is also used to check if a domino collides with another one.
            validIndices.delete(`${i},${j}`);
            validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);

            updateStructure(silenced);
            const dominoEntry = {
                cell: [i, j],
                domino: validDomino,
                direction: validDirection,
                flipped: validFlipped
            }
            if (!silenced) {
                const singlePlacementCells = Array.from(validCellsToDirections).filter(([cell, directions]) => directions.length === 1);
                finalSolution.push({ dominoEntry, reasoning: reasoningOnlyOneDomino, singlePlacementCells, additionalCellsThatGiveStructure: null, oneDirectionFromDominoEliminationCells });

            }

            foundAreasAndDominoes.push(dominoEntry);
            foundDominoes.push(validDomino);
        }
        // is it even necessary to check for the second condition in this or?
        // if nothing is added, would it just be undefined?
        else if (validCount === 0) {
            indicesToRegion = originalConditionsPointer;
            regions = originalRegionsPointer;
            validCellsToDirections = originalValidCellsToDirectionsValue;

            return { type: INVALID_ARRANGEMENT, cells: [[i, j]], reason: `No domino can fit in this cell`, lastPlacements: foundAreasAndDominoes };
        }
    }

    indicesToRegion = originalConditionsPointer;
    regions = originalRegionsPointer;
    //validCellsToDirections = originalValidCellsToDirections;
    return { foundPlacements: foundAreasAndDominoes, possiblePlacements: possibleDominoPlacementsSmallest };
}




// leastOptionsPlacement is an array of Domino Objects

let solutionCount = 1;

const lookAhead = (leastOptionsPlacement) => {
    const originalValidIndices = new Set(validIndices);
    const originalFoundDominoes = [...foundDominoes];
    let validOption = null;
    const originalConditionsPointer = indicesToRegion;
    const originalRegionsPointer = regions;
    const originalValidCellsToDirections = structuredClone(validCellsToDirections);
    const originalCellCoordinatesToIgnore = new Set(cellCoordinatesToIgnore);
    const originalOneDirectionFromDominoEliminationCells = new Set(oneDirectionFromDominoEliminationCells);
    let lastAddedToFinalSolution = [];

    class TreeNode {
        constructor(value, parent = null) {
            this.value = value;
            this.parent = parent;
            this.children = [];
            this.invalid = false;
            this.definitePlacements = [];
            this.cells = null;
            this.reason = null;
        }
    }
    const numberRootNodes = leastOptionsPlacement.length;
    const roots = leastOptionsPlacement.map(placement => new TreeNode(placement));

    for (let i = 0; i < roots.length; ++i) {

        let currentNode = roots[i];

        // does this do anything?
        if (currentNode.invalid)
            continue;


        ({ indicesToRegion, regions } = structuredClone({ indicesToRegion: originalConditionsPointer, regions: originalRegionsPointer }));
        validIndices = new Set(originalValidIndices);
        foundDominoes = [...originalFoundDominoes];
        validCellsToDirections = structuredClone(originalValidCellsToDirections);

        let depth = 0;

        do {
            let optionToModify = currentNode.value;
            const otherIndices = getOtherIndex(optionToModify.cell, optionToModify.direction);
            adjustConditions([{ cell: optionToModify.cell, value: optionToModify.domino[optionToModify.flipped ? 1 : 0] }, { cell: otherIndices, value: optionToModify.domino[optionToModify.flipped ? 0 : 1] }]);
            validIndices.delete(`${optionToModify.cell[0]},${optionToModify.cell[1]}`);
            validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);
            foundDominoes.push(optionToModify.domino);

            // add the definite placements to the final solution
            for (const definitePlacement of currentNode.definitePlacements) {
                const otherIndices = getOtherIndex(definitePlacement.cell, definitePlacement.direction);
                adjustConditions([{ cell: definitePlacement.cell, value: definitePlacement.domino[definitePlacement.flipped ? 1 : 0] }, { cell: otherIndices, value: definitePlacement.domino[definitePlacement.flipped ? 0 : 1] }]);
                validIndices.delete(`${definitePlacement.cell[0]},${definitePlacement.cell[1]}`);
                validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);
                foundDominoes.push(definitePlacement.domino);
            }
            currentNode = currentNode.parent;
            ++depth;
        } while (currentNode);


        // is this necessary?
        validCellsToDirections = structuredClone(originalValidCellsToDirections);
        cellCoordinatesToIgnore = new Set(originalCellCoordinatesToIgnore);
        oneDirectionFromDominoEliminationCells = new Set(originalOneDirectionFromDominoEliminationCells);

        const originalWillBePlaced = new Set(willBePlaced);
        updateStructure(true);
        willBePlaced = originalWillBePlaced;

        // often, this just adds the same thing to both sides of the tree (since either placement results in the same next placement with min possiblities)
        // I think I could optimize this...

        let result = runRules(true) // if any of the rules fail, then this option must not be possible
        if (result?.type === INVALID_ARRANGEMENT) {


            roots[i].invalid = true;
            let rootToCheck = roots[i];
            roots[i].cells = result?.cells;
            roots[i].reason = result?.reason;
            roots[i].definitePlacements = result?.foundPlacements;

            do {
                if (rootToCheck.parent && rootToCheck.parent.children.every(child => child.invalid)) {
                    rootToCheck.parent.invalid = true;
                }
                rootToCheck = rootToCheck.parent;
            } while (rootToCheck?.invalid);

            // if it has no parent (i.e, it is a root node)
            let invalidRootCount = 0;
            for (let j = 0; j < numberRootNodes; ++j) {
                if (roots[j].invalid)
                    invalidRootCount++;
            }

            if (invalidRootCount === numberRootNodes - 1) {
                // then place down the cell from the only valid option.
                indicesToRegion = originalConditionsPointer;
                regions = originalRegionsPointer;
                validIndices = new Set(originalValidIndices);
                foundDominoes = [...originalFoundDominoes];
                validCellsToDirections = structuredClone(originalValidCellsToDirections);
                for (let j = 0; j < numberRootNodes; ++j) {
                    if (roots[j].invalid === false) {
                        validOption = roots[j].value;
                    }
                    else {
                        (invalidRoots[JSON.stringify(roots[j].value.cell)] ??= []).push(roots[j]);
                    }
                }

                const dominoEntry = {
                    cell: validOption.cell,
                    domino: validOption.domino,
                    direction: validOption.direction,
                    flipped: validOption.flipped
                }

                const reasoning = `Added domino because all other root nodes are invalid at this cell: ${validOption.cell} (through performing depth ${depth} search) `;
                // console.log(reasoning);
                // console.dir(dominoEntry, { depth: null });
                // need to save the incorrect paths to show why they are wrong.
                // it's already saved in roots.


                const singlePlacementCells = Array.from(validCellsToDirections).filter(([cell, directions]) => directions.length === 1);
                finalSolution.push({ dominoEntry, reasoning, singlePlacementCells, additionalCellsThatGiveStructure: null, oneDirectionFromDominoEliminationCells });
                cellsToDirections.push(structuredClone(validCellsToDirections));
                //dominoPartCountHistory.push({ ...dominoPartCounts });


                foundDominoes.push(validOption.domino);
                const otherIndices = getOtherIndex(validOption.cell, validOption.direction);

                // is this necessary?
                // validCellsToDirections.set(dominoEntry.cell.join(','), [dominoEntry.direction]);
                // validCellsToDirections.delete(otherIndices.join(','));

                const validOptionAreaString = `${validOption.cell[0]},${validOption.cell[1]}`;
                validIndices.delete(validOptionAreaString);
                validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);


                // is this to the original indices pointer?
                adjustConditions([{ cell: validOption.cell, value: validOption.domino[validOption.flipped ? 1 : 0] }, { cell: otherIndices, value: validOption.domino[validOption.flipped ? 0 : 1] }]);
                updateStructure();

                const result = { foundPlacements: [dominoEntry] }
                return result;
            }
            continue;
        }

        else {
            if (!canPlaceDomino()) {
                let currentNode = roots[i];
                lastAddedToFinalSolution = [];

                do {
                    lastAddedToFinalSolution.push({ dominoEntry: currentNode.value, reasoning: 'guess' });
                    lastAddedToFinalSolution.push(...currentNode.definitePlacements.map(placement => {
                        return { dominoEntry: placement, reasoning: reasoningOnlyOneDomino }
                    }));
                    currentNode = currentNode.parent;
                } while (currentNode && !finalSolution.some(entry => entry.dominoEntry?.domino === currentNode.value.domino));

                // lastAddedToFinalSolution.push(...(previousPlacements).map(placement => {
                //     return {
                //         dominoEntry: placement,
                //         reasoning: 'guess'
                //     }
                // }));

                // console.log(`Solution ${solutionCount++} After trying the following placements: ${JSON.stringify(previousPlacements, null, 2)}`);
                // console.log(`found Placements ${JSON.stringify(result?.foundPlacements, null, 2)}`)
                lastAddedToFinalSolution.push(...(result?.foundPlacements).map(placement => {
                    return {
                        dominoEntry: placement,
                        reasoning: reasoningOnlyOneDomino,
                        singlePlacementCells: [],
                        additionalCellsThatGiveStructure: null,
                        oneDirectionFromDominoEliminationCells: new Set()
                    }
                }));
                // uncomment this to return only the first solution.
                // return { foundPlacements: [...result?.foundPlacements] };
                continue;
            }
        }
        // if you found a solution, then you should not add any of the possible placements as children.
        // but should you adda any of the definite placements either?

        roots[i].definitePlacements = [...(result?.foundPlacements || [])];

        leastOptionsPlacement = result?.possiblePlacements;
        roots[i].children = leastOptionsPlacement.map(placement => new TreeNode(placement));
        roots[i].children.forEach(child => { child.parent = roots[i] });
        roots.push(...roots[i].children);
    }

    finalSolution.push(...lastAddedToFinalSolution);

}


export const alterOneCombinationRegion = (combinations, regionIndices) => {
    let onlyValue = -1;
    const firstCombo = JSON.parse(combinations.values().next().value);
    let numberOfNonZeroEntries = 0;
    for (const key of Object.keys(firstCombo).map(Number)) {
        if (firstCombo[key] > 0) {
            ++numberOfNonZeroEntries;
            onlyValue = key;
        }
        if (numberOfNonZeroEntries > 1)
            break;
    }
    if (numberOfNonZeroEntries === 1) {
        for (const index of regionIndices) {
            const indexKey = `${index[0]},${index[1]}`;
            indicesToRegion[indexKey] = { type: 'sum', target: onlyValue, numberOfCells: 1, indices: [index] }
            regions.push(indicesToRegion[indexKey]);
        }
        regions.splice(i--, 1);
    }
}

// checks if it is possible for domino to go into [row, col]. assume that row and col exist in the grid.
// need to use data from current board solve

// updates the allowable combinations of each sum area based on the user's avaiable inputs.
// e.g, if the user doesn't have a 4 and there are two cells with sum 9, then it must be made with 3 and 6 So update the counts for those halves.
const updateRegionsAndDominoPartCounts = () => {
    dominoPartCounts = { ...initialDominoPartCounts }
    for (const domino of foundDominoes) {
        dominoPartCounts[domino[0]] -= 1;
        dominoPartCounts[domino[1]] -= 1;
    }
    // go through the 1 cell regions first.
    // for (let i = 0; i < regions.length; ++i) {
    //     const entry = regions[i];
    //     if (entry.indices.length === 1 && entry.type === 'sum' && validIndices.has(entry.indices[0].join(','))) {
    //         --dominoPartCounts[entry.target];
    //     }
    //     else if (entry.indices.length === 1 && entry.type === 'greater') {
    //         if (entry.target === '5' && validIndices.has(entry.indices[0].join(','))) {
    //             indicesToRegion[indexKey] = { type: 'sum', target: 6, numberOfCells: 1, indices: [i] }
    //             --dominoPartCounts[6];
    //         }
    //     }
    //     else if (entry.indices.length === 1 && entry.type === 'less' && validIndices.has(entry.indices[0].join(','))) {
    //         if (entry.target === '1') {
    //             indicesToRegion[indexKey] = { type: 'sum', target: 0, numberOfCells: 1, indices: [i] }
    //             --dominoPartCounts[0];
    //         }
    //     }
    // }

    // say there is a 12 region in 2 cells that wasn't elimiated earlier. This must use two 6's.
    // say you go through a 15 region in 3 cells. Possible combos are 5,5,5 or 6,4,5.
    // if you don't go through the 12 region first, then it's possible you wouldn't be able to eliminate the 6,4,5 region in the case that you only have 2 6 domino halves in total left.
    // so after decreasing domino pip counts, it's necessary to go through every >1 size combo region again?
    for (let i = 0; i < regions.length; ++i) {
        const entry = regions[i];
        if (entry.type === 'sum' || entry.type === 'greater' || entry.type === 'less') {
            if (entry.indices.length > 1) {
                const { totalCombinations: combinations, minNumberOfPipsUsed, unusedPipsValues } = getCombinations(entry.target, entry.indices.length, entry.type);
                entry.combinations = combinations;
                entry.unusedPipsValues = unusedPipsValues;
                entry.minNumberOfPipsUsed = minNumberOfPipsUsed;
                let numberOfNonZeroEntries = 0;
                if (combinations.size === 0) {
                    return { type: INVALID_ARRANGEMENT, reason: `For the ${JSON.stringify(entry.indices)} region, there are no combinations of pips values that ${entry.type === 'sum' ? 'sum to' : entry.type === 'greater' ? 'are greater than' : 'are less than'} ${entry.target}.` }
                }
                else if (combinations.size === 1) {
                    let onlyValue = -1;
                    const firstCombo = JSON.parse(combinations.values().next().value);
                    for (const key of Object.keys(firstCombo).map(Number)) {
                        if (firstCombo[key] > 0) {
                            ++numberOfNonZeroEntries;
                            onlyValue = key;
                        }
                        if (numberOfNonZeroEntries > 1)
                            break;
                    }
                    if (numberOfNonZeroEntries === 1) {
                        for (const index of entry.indices) {
                            const indexKey = `${index[0]},${index[1]}`;
                            indicesToRegion[indexKey] = { type: 'sum', target: onlyValue, numberOfCells: 1, indices: [index] }
                            regions.push(indicesToRegion[indexKey]);
                        }
                        regions.splice(i--, 1);
                    }
                    // the min pip counts aren't subtracted here but rather when you get to the region within the loop instead.
                }
                // let removeCombinations take care of this?
                // if (numberOfNonZeroEntries !== 1)
                //     for (const pipsValue of Object.keys(minNumberOfPipsUsed).map(Number)) {
                //         dominoPartCounts[pipsValue] -= minNumberOfPipsUsed[pipsValue];
                //     }
            }
            else if (entry.indices.length === 1 && entry.type === 'sum' && validIndices.has(entry.indices[0].join(','))) {
                --dominoPartCounts[entry.target];
            }
            else if (entry.indices.length === 1 && entry.type === 'greater') {
                if (entry.target === '5' && validIndices.has(entry.indices[0].join(','))) {
                    indicesToRegion[indexKey] = { type: 'sum', target: 6, numberOfCells: 1, indices: [i] }
                    --dominoPartCounts[6];
                }
            }
            else if (entry.indices.length === 1 && entry.type === 'less' && validIndices.has(entry.indices[0].join(','))) {
                if (entry.target === '1') {
                    indicesToRegion[indexKey] = { type: 'sum', target: 0, numberOfCells: 1, indices: [i] }
                    --dominoPartCounts[0];
                }
            }
        }
        if (Object.values(dominoPartCounts).some(val => val < 0))
            return { type: INVALID_ARRANGEMENT, reason: `One of the domino part counts is below 0: ${JSON.stringify(dominoPartCounts)}` };
    }

    removeCombinations()

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
                return { type: INVALID_ARRANGEMENT, cells: entry.indices, reason: `equals region has no valid values` };
        }
    }
}





export const isOutOfBoundsOrFilled = (row, col) => {
    return !validIndices.has(`${row},${col}`);
}





const runRules = (silenced = false) => {
    // first time, this is fine. But on later calls, it's more efficient to just call updateRegions on everything.
    // or maybe you don't need to even call that as adjustcombinations could already be modifying the combinations.
    let result = updateRegionsAndDominoPartCounts();
    if (result?.type !== INVALID_ARRANGEMENT) {
        result = runUntilNoDefinitePlacements(silenced);
        if (result?.type !== INVALID_ARRANGEMENT && result.foundPlacements.length === 0) {
            if (result?.type !== INVALID_ARRANGEMENT) {
                result = updateEqualsRegions();
                if (result?.type !== INVALID_ARRANGEMENT)
                    result = runUntilNoDefinitePlacements(silenced);
            }
        }
    }
    return result
}

const runUntilNoDefinitePlacements = (silenced) => {

    // let onlyOneDominoResult = null;
    // let onlyOneAreaResult = null;
    // const allFoundPlacements = [];
    // do {
    //     onlyOneDominoResult = rule_canOnlyBePlacedByOneDomino(dominoes, silenced);
    //     if (onlyOneDominoResult?.type !== INVALID_ARRANGEMENT && onlyOneDominoResult.foundPlacements.length > 0) {
    //         allFoundPlacements.push(...onlyOneDominoResult.foundPlacements);
    //         continue;
    //     }
    //     onlyOneAreaResult = rule_canOnlyBePlacedInOneArea();
    //     if (onlyOneAreaResult?.type !== INVALID_ARRANGEMENT) {
    //         allFoundPlacements.push(...onlyOneAreaResult.foundPlacements);
    //         continue;
    //     }
    //     if (onlyOneDominoResult?.type !== INVALID_ARRANGEMENT && onlyOneDominoResult.foundPlacements.length > 0) {
    //         allFoundPlacements.push(...onlyOneDominoResult.foundPlacements);
    //     }
    // } while (result?.type !== INVALID_ARRANGEMENT && result.foundPlacements.length > 0 && canPlaceDomino());

    let result = null;
    const allFoundPlacements = [];
    do {
        result = rule_canOnlyBePlacedByOneDomino(dominoes, silenced);
        if (result?.type === INVALID_ARRANGEMENT)
            break;
        const oneAreaResult = rule_canOnlyBePlacedInOneArea(indicesToRegion, regions, silenced);
        if (oneAreaResult?.type === INVALID_ARRANGEMENT) {
            result.type = INVALID_ARRANGEMENT;
            break;
        }

        result.foundPlacements.push(...oneAreaResult.foundPlacements);

        // let index = 0;
        // for (const possiblePlacement of result.possiblePlacements) {
        //     // if(foundDominoes.some(foundDomino => possiblePlacement.domino[0] === foundDomino[0] && possiblePlacement.domino[1] === foundDomino[1]))
        //     //     result.possiblePlacements.splice(index);
        //     // else
        //     //     ++index;
        //     if (oneAreaResult.foundPlacements.some(foundPlacement => foundPlacement.dominoEntry.cell[0] === possiblePlacement.cell[0] && foundPlacement.dominoEntry.cell[1] === possiblePlacement.cell[1]))
        //         result.possiblePlacements.splice(index);
        //     else
        //         ++index;
        // }
        // if all the possible placements were deleted, then is that case considered?
        allFoundPlacements.push(...result.foundPlacements);

    } while (result.foundPlacements.length > 0 && canPlaceDomino());

    allFoundPlacements.push(...(result.lastPlacements || []));

    result.foundPlacements = allFoundPlacements;
    return result;
}


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

export const solve = async () => {
    const date = new Date(document.querySelector('#puzzle-date').value);
    const difficulty = document.querySelector('#puzzle-difficulty').value.toLowerCase();

    const allData = await fetch(`https://www.nytimes.com/svc/pips/v1/${date.toISOString().split('T')[0]}.json`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/[IP_ADDRESS] Safari/537.36'
        }
    });

    const json = await allData.json();

    if (difficulty !== EASY && difficulty !== MEDIUM && difficulty !== HARD)
        throw new Error(`difficulty ${difficulty} is not valid`);

    const data = json[difficulty.toLowerCase()];
    dominoes = data.dominoes;
    board = data.regions;
    getBoardCoords(board);
    updateRegionsAndDominoPartCounts();
    updateStructure();

    const singlePlacementCells = Array.from(validCellsToDirections.entries()).filter(([cell, direction]) => direction.length === 1);
    if (singlePlacementCells.length > 0)
        finalSolution.push({ singlePlacementCells });


    checkRequiresDouble();
    while (canPlaceDomino() && iterations++ < MAX_ITERATIONS) {
        result = runRules()
        //if (!(result?.foundPlacements || result.foundPlacements.length === 1) && result !== INVALID_ARRANGEMENT) {
        if (result?.foundPlacements && result.foundPlacements.length === 0 && result?.possiblePlacements && result?.possiblePlacements.length > 0) {
            // remove the conditions from updating equals if it isn't necessary?
            result = lookAhead(result.possiblePlacements);
        }
        if (result?.type === INVALID_ARRANGEMENT)
            break;
    }
    if (iterations === MAX_ITERATIONS) {
        console.log("puzzle not solved, took too long")
        return;
    }

    //console.dir(result, { depth: null });
    if (!canPlaceDomino()) {
        done = true;
        console.log("puzzle solved?")
    }
}