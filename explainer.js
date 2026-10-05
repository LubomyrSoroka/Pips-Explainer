
export let finalSolution;
export let invalidRoots;
export let done;
export let initialDominoPartCounts;
export let dominoes;
export let board;
export let cellsToDirections;
export let dominoPartCounts;

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

import { getCombinations } from "./GetCombinations.js";

export const solve = async () => {
    cellsToDirections = [];
    finalSolution = [];
    invalidRoots = new Map();
    done = false;
    initialDominoPartCounts = null;

    let indicesToRegion = {};
    let validIndices = new Set();


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

    let regions = [];
    const getBoardCoords = (board) => {
        let previousIndex;
        board.forEach((entry) => {
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
    const INVALID_ARRANGEMENT = 'Invalid arrangement'

    const EASY = 'easy';
    const MEDIUM = 'medium';
    const HARD = 'hard';

    const CONNECTED = 'connected';

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

    // map from each cell to the directions that this cell can take
    let validCellsToDirections = new Map();
    const cellCoordinatesToIgnore = new Set();
    let updatedStructureOnce = false;

    const updateStructure = () => {
        // find all placements which can only take one value.
        // put a fake domino there and repeat this process until you can't find any more guaranteed placemnets or have no more dominoes to fill on the board.

        // need to update: if in all other directions no domino satifies the conditions (so there are only dominoes that satisfy the conditions of the cell in one direction).
        // then you know the direction of the cell and can update other cells accordingly.
        const originalValidIndices = new Set(validIndices);
        let hasOneDirectionCell = false;
        do {
            hasOneDirectionCell = false;
            for (const [i, j] of Array.from(validIndices).map(indices => indices.split(',').map(Number))) {
                if (updatedStructureOnce && (!validCellsToDirections.get(`${i},${j}`) || validCellsToDirections.get(`${i},${j}`).length === 1)) {
                    continue;
                }
                if (cellCoordinatesToIgnore.has(`${i},${j}`)) {
                    continue;
                }
                const additions = [[DOWN, 1, 0], [UP, -1, 0], [LEFT, 0, -1], [RIGHT, 0, 1]]
                let validDirectionCount = 0;
                let otherIndex = null;
                const otherIndices = [];
                const validDirections = [];
                let validOtherIndex = null;

                for (const [direction, deltaRow, deltaCol] of additions) {
                    otherIndex = [i + deltaRow, j + deltaCol];
                    //if (!cellCoordinatesToIgnore.get(`${i},${j}`)?.has(`${otherIndex[0]},${otherIndex[1]}`)) {
                    if (isOutOfBounds(i + deltaRow, j + deltaCol))
                        continue;
                    let hasValid = false;

                    outerDominoLoop: for (const domino of dominoes) {
                        for (const flip of [0, 1]) {
                            if (!satisfiesRegionConditions(i, j, flip ? domino[1] : domino[0]))
                                continue;
                            hasValid = check(i, j, domino, direction, flip);
                            if (hasValid)
                                break outerDominoLoop;
                        }
                    }
                    if (hasValid) {
                        validDirectionCount += 1;
                        validOtherIndex = [...otherIndex];
                        validDirections.push(direction);
                        otherIndices.push(otherIndex);
                    }
                    //}
                }
                if (validDirectionCount === 1) {
                    validIndices.delete(`${i},${j}`)
                    validIndices.delete(`${validOtherIndex[0]},${validOtherIndex[1]}`)
                    validCellsToDirections.delete(`${validOtherIndex[0]},${validOtherIndex[1]}`)
                    hasOneDirectionCell = true;
                    cellCoordinatesToIgnore.add(`${validOtherIndex[0]},${validOtherIndex[1]}`);
                }
                // else if (validDirectionCount === 0) {
                //     // then you must've already put a domino here?
                //     continue;
                // }
                validCellsToDirections.set(`${i},${j}`, validDirections);
            }
        } while (hasOneDirectionCell);
        updatedStructureOnce = true;
        validIndices = new Set(originalValidIndices);
    }


    const reasoningOnlyOneDomino = "Added domino in this position through rule_canOnlyBePlacedByOneDomino";
    let foundDominoes = [];
    const rule_canOnlyBePlacedByOneDomino = (dominoes, silenced = false) => {
        const foundAreasAndDominoes = [];
        let possibleDominoPlacementsSmallest = [];
        let possibleDominoPlacementsCurrent = [];

        const originalConditionsPointer = indicesToRegion;
        const originalRegionsPointer = regions;
        const originalValidCellsToDirections = validCellsToDirections;
        let minPossiblePlacementsCount = Infinity;

        nextCell: for (const [i, j] of Array.from(validCellsToDirections.keys()).map(key => key.split(',').map(Number))) {
            // this should check that you aren't placing the domino on a cell that already has a domino on it (not really checking that you're placing something out of bounds) 
            if (!validCellsToDirections.get(`${i},${j}`) || isOutOfBounds(i, j))
                continue;

            let validCount = 0;
            let validDomino = null;
            let validDirection = null;
            let validFlipped = null;
            possibleDominoPlacementsCurrent = [];
            const validDirections = validCellsToDirections.get(`${i},${j}`);

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

                    // should be able to get rid of the JSON.stringify here
                    if (JSON.stringify(indicesToRegion[key].indices) === JSON.stringify(indicesToRegion[key2].indices) || (indicesToRegion[key].type === 'empty' && indicesToRegion[key2].type === 'empty'))
                        flipCount = 1;
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
                updateStructure();
                const dominoEntry = {
                    cell: [i, j],
                    domino: validDomino,
                    direction: validDirection,
                    flipped: validFlipped
                }
                if (!silenced) {
                    // console.log("added domino", dominoEntry)
                    finalSolution.push({ dominoEntry, reasoning: reasoningOnlyOneDomino });

                    // this returns the map with all directions after inserting each cell.
                    cellsToDirections.push(structuredClone(validCellsToDirections));
                }

                foundAreasAndDominoes.push(dominoEntry);
                foundDominoes.push(validDomino);
            }
            // is it even necessary to check for the second condition in this or?
            // if nothing is added, would it just be undefined?
            else if (validCount === 0) {
                indicesToRegion = originalConditionsPointer;
                regions = originalRegionsPointer;
                validCellsToDirections = originalValidCellsToDirections;

                return { type: INVALID_ARRANGEMENT, cells: [[i, j]], reason: `No domino can fit in this cell`, lastPlacements: foundAreasAndDominoes };
            }
        }

        // if (foundAreasAndDominoes.length > 0)
        //     return { foundPlacements: foundAreasAndDominoes };
        // else
        //     return { possiblePlacements: possibleDominoPlacements };
        indicesToRegion = originalConditionsPointer;
        regions = originalRegionsPointer;
        validCellsToDirections = originalValidCellsToDirections;
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
        const originalValidCellsToDirections = validCellsToDirections;
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
            updateStructure();

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


                    finalSolution.push({ dominoEntry, reasoning });

                    foundDominoes.push(validOption.domino);
                    const otherIndices = getOtherIndex(validOption.cell, validOption.direction);
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
                    const previousPlacements = [];
                    lastAddedToFinalSolution = [];

                    do {
                        previousPlacements.push(currentNode.value);
                        currentNode = currentNode.parent;
                    } while (currentNode && !finalSolution.some(entry => entry.dominoEntry.domino === currentNode.value.domino));

                    lastAddedToFinalSolution.push(...(previousPlacements).map(placement => {
                        return {
                            dominoEntry: placement,
                            reasoning: 'guess'
                        }
                    }));

                    // console.log(`Solution ${solutionCount++} After trying the following placements: ${JSON.stringify(previousPlacements, null, 2)}`);
                    // console.log(`found Placements ${JSON.stringify(result?.foundPlacements, null, 2)}`)
                    lastAddedToFinalSolution.push(...(result?.foundPlacements).map(placement => {
                        return {
                            dominoEntry: placement,
                            reasoning: reasoningOnlyOneDomino
                        }
                    }));
                    // uncomment this to return only the first solution.
                    // return { foundPlacements: [...result?.foundPlacements] };
                }
            }

            roots[i].definitePlacements = [...(result?.foundPlacements || [])];

            leastOptionsPlacement = result?.possiblePlacements;
            roots[i].children = leastOptionsPlacement.map(placement => new TreeNode(placement));
            roots[i].children.forEach(child => { child.parent = roots[i] });
            roots.push(...roots[i].children);
        }

        finalSolution.push(...lastAddedToFinalSolution);

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

    // const updateSumMultipleOfSixAndZeroes = () => {
    //     for (const [index, entry] of regions.entries()) {
    //         if (entry.type === 'sum') {
    //             if (entry.indices.length >= 2 && entry.target > 12 && entry.target % 6 === 0) {
    //                 const replaced = false;
    //                 for (const index of entry.indices) {
    //                     const indexKey = `${index[0]},${index[1]}`;
    //                     if (validIndices.has(indexKey)) {
    //                         replced = true;
    //                         indicesToRegion[indexKey] = { type: 'sum', target: 6, numberOfCells: 1, indices: [index] }
    //                         regions.push(indicesToRegion[indexKey]);
    //                     }
    //                 }
    //                 if (replaced) {
    //                     regions.splice(index, 1);
    //                     console.log(`replacing region ${JSON.stringify(entry.indices)} with 6's`)
    //                 }
    //             }
    //             else if (entry.indices.length >= 2 && entry.target === 0) {
    //                 let replaced = false;
    //                 for (const index of entry.indices) {
    //                     const indexKey = `${index[0]},${index[1]}`;
    //                     if (validIndices.has(indexKey)) {
    //                         replaced = true;
    //                         indicesToRegion[indexKey] = { type: 'sum', target: 0, numberOfCells: 1, indices: [index] }
    //                         regions.push(indicesToRegion[indexKey]);
    //                     }
    //                 }
    //                 if (replaced) {
    //                     console.log(`replacing region ${JSON.stringify(entry.indices)} with 0's`)
    //                     regions.splice(index, 1);
    //                 }
    //             }
    //         }
    //         if (entry.type === 'greater') {
    //             // convert >5 to 6 if one cell, >11 to 12 (or two 6's if two cells), etc.

    //         }
    //     }
    // }

    // const updateDominoPartCounts = () => {
    //     dominoPartCounts = { ...initialDominoPartCounts }
    //     for (const domino of foundDominoes) {
    //         dominoPartCounts[domino[0]] -= 1;
    //         dominoPartCounts[domino[1]] -= 1;
    //     }
    //     for (const entry of regions) {
    //         if (entry.type === 'sum') {
    //             // the reason for checking if the index is in validIndices (the indices of the cells which haven't been assigned any domnino yet)
    //             // is because when you add a domino there, the sum will go to 0 and which will subtract from the number of 0's
    //             // and then you will get an invalid configuration because the number of 0 is below 0 (which isn't really true.)
    //             if (entry.indices.length === 1 && validIndices.has(entry.indices[0].join(',')))
    //                 dominoPartCounts[entry.target] -= 1;
    //             else if (entry.target > 7 && entry.target % 6 === 1) {// e.g. if it is 11, 17 and so on...
    //                 const sixesToSubtract = Math.trunc(entry.target / 6);
    //                 dominoPartCounts[6] -= sixesToSubtract;
    //                 dominoPartCounts[5] -= 1;
    //             }
    //             if (Object.values(dominoPartCounts).some(val => val < 0))
    //                 return { type: INVALID_ARRANGEMENT, reason: `One of the domino part counts is below 0: ${JSON.stringify(dominoPartCounts)}` };
    //         }
    //     }
    //     //console.log(dominoPartCounts);
    //     return true;
    // }

    // updates the allowable combinations of each sum area based on the user's avaiable inputs.
    // e.g, if the user doesn't have a 4 and there are two cells with sum 9, then it must be made with 3 and 6 So update the counts for those halves.
    const updateRegionsAndDominoPartCounts = () => {
        dominoPartCounts = { ...initialDominoPartCounts }
        for (const domino of foundDominoes) {
            dominoPartCounts[domino[0]] -= 1;
            dominoPartCounts[domino[1]] -= 1;
        }
        for (const [index, entry] of regions.entries()) {
            if (entry.type === 'sum' || entry.type === 'greater' || entry.type === 'less') {
                if (entry.indices.length > 1) {
                    const { combinations, minNumberOfPipsUsed, unusedPipsValues } = getCombinations(entry.target, entry.indices.length, entry.type);
                    entry.unusedPipsValues = unusedPipsValues;
                    if (combinations.size === 0) {
                        return { type: INVALID_ARRANGEMENT, reason: `For the ${JSON.stringify(entry.indices)} region, there is no combinations of pips values that sum to ${entry.target}.` }
                    }
                    else if (combinations.size === 1) {
                        let onlyValue = -1;
                        const firstCombo = combinations.values().next().value;
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
                            let replaced = false;
                            for (const index of entry.indices) {
                                const indexKey = `${index[0]},${index[1]}`;
                                if (validIndices.has(indexKey)) {
                                    replaced = true;
                                    indicesToRegion[indexKey] = { type: 'sum', target: onlyValue, numberOfCells: 1, indices: [index] }
                                    regions.push(indicesToRegion[indexKey]);
                                }
                            }
                            if (replaced) {
                                regions.splice(index, 1);
                                console.log(`replacing region ${JSON.stringify(entry.indices)} with ${onlyValue}'s`)
                            }
                        }
                    }
                    else {
                        entry.combinations = combinations;
                    }
                    for (const pipsValue of Object.keys(minNumberOfPipsUsed).map(Number)) {
                        dominoPartCounts[pipsValue] -= minNumberOfPipsUsed[pipsValue];
                    }
                }
                else if (entry.indices.length === 1 && entry.type === 'greater') {
                    if (entry.target === '5' && validIndices.has(entry.indices[0].join(','))) {
                        indicesToRegion[indexKey] = { type: 'sum', target: 6, numberOfCells: 1, indices: [index] }
                        --dominoPartCounts[6];
                    }
                }
                else if (entry.indices.length === 1 && entry.type === 'less' && validIndices.has(entry.indices[0].join(','))) {
                    if (entry.target === '1') {
                        indicesToRegion[indexKey] = { type: 'sum', target: 0, numberOfCells: 1, indices: [index] }
                        --dominoPartCounts[0];
                    }
                }
                else if (entry.indices.length === 1 && entry.type === 'sum' && validIndices.has(entry.indices[0].join(','))) {
                    --dominoPartCounts[entry.target];
                }
            }
            if (Object.values(dominoPartCounts).some(val => val < 0))
                return { type: INVALID_ARRANGEMENT, reason: `One of the domino part counts is below 0: ${JSON.stringify(dominoPartCounts)}` };
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
                    return { type: INVALID_ARRANGEMENT, cells: entry.indices, reason: `equals region has no valid values` };
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

    //await fetch('https://www.nytimes.com/games/pips/easy');

    const date = new Date(document.querySelector('#puzzle-date').value);
    const difficulty = document.querySelector('#puzzle-difficulty').value.toLowerCase();

    // const date = new Date('2026-09-23T00:00:00Z'); // leave the part after T to ensure that this is in UTC. That way when converting the date to string, it doesn't change based on your timezone.
    // const difficulty = HARD;
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

    console.dir(dominoes)
    console.dir(board, { depth: null })


    const runRules = (silenced = false) => {
        let result = updateRegionsAndDominoPartCounts();
        if (result?.type !== INVALID_ARRANGEMENT) {
            result = runUntilNoDefinitePlacements(silenced);
            if (result?.type !== INVALID_ARRANGEMENT && result.foundPlacements.length === 0) {
                // updateSumMultipleOfSixAndZeroes();
                // result = updateDominoPartCounts();
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
        let result = null;
        const allFoundPlacements = [];
        do {
            result = rule_canOnlyBePlacedByOneDomino(dominoes, silenced);
            if (result?.type !== INVALID_ARRANGEMENT)
                allFoundPlacements.push(...result.foundPlacements);
            // What is this even doing result.possiblePlacements will always be true (empty array is true in js).
            //} while (!result?.possiblePlacements && result !== INVALID_ARRANGEMENT && canPlaceDomino());
            // keep doing it while the number of found placements is greater than 0

        } while (result?.type !== INVALID_ARRANGEMENT && result.foundPlacements.length > 0 && canPlaceDomino());

        allFoundPlacements.push(...(result?.lastPlacements || []));

        result.foundPlacements = allFoundPlacements;
        return result;
    }

    getBoardCoords(board);
    updateStructure();
    checkRequiresDouble();

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
        if (result?.foundPlacements && result.foundPlacements.length === 0 && result?.possiblePlacements && result?.possiblePlacements.length > 0) {
            // remove the conditions from updating equals if it isn't necessary?
            result = lookAhead(result.possiblePlacements);
        }
        if (result?.type === INVALID_ARRANGEMENT)
            break;
    }

    //console.dir(result, { depth: null });
    if (!canPlaceDomino()) {
        done = true;
        console.log("puzzle solved?")
    }
}