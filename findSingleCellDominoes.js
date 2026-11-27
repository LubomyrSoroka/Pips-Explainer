import { indicesToRegion, regions, validCellsToDirections, noRepeatPossibleDominoPlacements, dominoes, check, getOtherIndex, getOtherIndexString, adjustConditions, isOutOfBoundsOrFilled, foundDominoes, copyIndicesAndRegions, resetIndicesAndRegions, satisfiesRegionConditions, INVALID_ARRANGEMENT } from "./explainer.js"

export let dominoesPerCell = {};

let dominoCellPairToDirections = {};

export const resetVars = () => {
    dominoesPerCell = {};
    dominoCellPairToDirections = {};
    dominoSetsToDelete = [];
}
const dominoesPerCellNoRepeats = {};

export const findSingleCellDominoes = () => {

    const originalConditionsPointer = indicesToRegion;
    const originalRegionsPointer = regions;

    const cellsToCheck = Array.from(validCellsToDirections.keys()).map(key => key.split(',').map(Number));
    nextCell: for (const [i, j] of cellsToCheck) {

        // this should check that you aren't placing the domino on a cell that already has a domino on it (not really checking that you're placing something out of bounds) 
        if (isOutOfBoundsOrFilled(i, j)) {
            continue;
        }

        const validDirections = validCellsToDirections.get(`${i},${j}`);

        for (const domino of dominoes) {

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
            for (let k = 0; k < flipCount; ++k) {
                //({ indicesToRegion, regions } = structuredClone({ indicesToRegion: originalConditionsPointer, regions: originalRegionsPointer }));
                copyIndicesAndRegions(originalConditionsPointer, originalRegionsPointer);
                if (!satisfiesRegionConditions(i, j, domino[k]))
                    continue;
                adjustConditions([{ cell: [i, j], value: domino[k] }])
                for (const direction of validDirections) {
                    // if there are only two options to consider (like in a corner) and only one of them is possible, then you must place the domino there.
                    let result = check(i, j, domino, direction, k === 1);
                    if (result === true) {
                        dominoesPerCell[`${i},${j}`] ??= new Set()
                        dominoesPerCell[`${i},${j}`].add(domino);
                        if(noRepeatPossibleDominoPlacements.has(`${i},${j}`)){
                            dominoesPerCellNoRepeats[`${i},${j}`] ??= new Set()
                            dominoesPerCellNoRepeats[`${i},${j}`].add(domino);
                        }
                        dominoCellPairToDirections[`${i},${j}` + `${domino[0]},${domino[1]}`] ??= new Set();
                        dominoCellPairToDirections[`${i},${j}` + `${domino[0]},${domino[1]}`].add(direction);

                    }

                }
            }
        }
    }
    resetIndicesAndRegions(originalConditionsPointer, originalRegionsPointer);
    //findMustBePlacedDominoes();
    getEquivalentSets();

}

const findMustBePlacedDominoes = () => {
    // isn't this just equivalent to the above function but for sets of size one?
    let i = 0;
    const dominoSets = Object.entries(dominoesPerCellNoRepeats);
    while (i < dominoSets.length) {
        const [coords, dominoSet] = dominoSets[i];
        if (dominoSet.size === 1) {
            const onlyValue = dominoSet.values().next().value;
            nextDominoSet: for (const [otherCoords, otherDominoSet] of dominoSets) {
                if (otherDominoSet === dominoSet)
                    continue;
                // if the other cell from which this otherDominoSet comes from happens to 
                // be a cell where this cell and the original cell of the outer loop dominoSet is a valid placement for the domino, then
                // don't delete the domino from the other set.
                
                // I'm looking back at this comment and I believe that this is to prevent the other cell from having 0 possible placements?
                const directions = dominoCellPairToDirections[coords + `${onlyValue[0]},${onlyValue[1]}`];
                for (const direction of directions) {
                    const otherCoordsFromOriginal = getOtherIndexString(coords, direction)
                    if (otherCoords === `${otherCoordsFromOriginal[0]},${otherCoordsFromOriginal[1]}`)
                        continue nextDominoSet;
                }

                const deleted = otherDominoSet.delete(onlyValue)
                if (deleted && otherDominoSet.size === 1)
                    i = -1;
            }
        }
        ++i;
    }
}

const getDominoes = (i, j, existingValidDominoes, originalConditionsPointer, originalRegionsPointer) => {
    for (const domino of existingValidDominoes) {
        if (foundDominoes.some(foundDomino => foundDomino[0] === domino[0] && foundDomino[1] === domino[1]))
            continue;
        let flipCount = 2;
        const validDirections = validCellsToDirections.get(`${i},${j}`);
        if (!validDirections)
            continue;
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
            //({ indicesToRegion, regions } = structuredClone({ indicesToRegion: originalConditionsPointer, regions: originalRegionsPointer }));

            copyIndicesAndRegions(originalConditionsPointer, originalRegionsPointer);
            if (!satisfiesRegionConditions(i, j, domino[k]))
                continue;
            adjustConditions([{ cell: [i, j], value: domino[k] }])
            for (const direction of validDirections) {
                // if there are only two options to consider (like in a corner) and only one of them is possible, then you must place the domino there.
                let result = check(i, j, domino, direction, k === 1);
                if (result === true) {
                    dominoesPerCell[`${i},${j}`] ??= new Set()
                    dominoesPerCell[`${i},${j}`].add(domino);
                    dominoCellPairToDirections[`${i},${j}` + `${domino[0]},${domino[1]}`] ??= new Set();
                    dominoCellPairToDirections[`${i},${j}` + `${domino[0]},${domino[1]}`].add(direction);

                }

            }
        }
    }
    resetIndicesAndRegions(originalConditionsPointer, originalRegionsPointer);
}


const getSurroundingCells = (cell1, cell2) => {
    const surroundingCells = new Set()
    for (const [incrementx, incrementy] of [[1, 0], [-1, 0], [0, 1], [0, -1]])
        for (const cell of [cell1, cell2]) {
            const cellToAdd = [cell[0] + incrementx, cell[1] + incrementy];
            if (isOutOfBoundsOrFilled(cellToAdd[0], cellToAdd[1]))
                continue;
            // don't add the cell if it's just one of the existing cells.
            if ((cellToAdd[0] === cell1[0] && cellToAdd[1] === cell1[1]) || (cellToAdd[0] === cell2[0] && cellToAdd[1] === cell2[1]))
                continue;
            surroundingCells.add(cellToAdd);
        }
    return surroundingCells;
}

// search through all dominoSets. If there n areas which have the exact same n dominoes, then you can remove those dominoes from other regions.
// if n areas all have the exact same dominoes but there are fewer than n dominoes in each one, then you have an invalid configuration.
const setsEqual = (setA, setB) => setA.size === setB.size && setA.isSubsetOf(setB);

let dominoSetsToDelete = [];

const getEquivalentSets = () => {
    //const filteredSets = dominoSets.filter(( [coords, dominoSet] ) => dominoSet.size > 1);
    let deletedValue = false;
    //let newDominoSetsToDelete = new Set();
    do{
        const dominoSets = Object.entries(dominoesPerCell);
        deletedValue = false;
        nextSet: for(const [coords, set] of dominoSets){
            if(dominoSetsToDelete.some(existingSet => setsEqual(existingSet[1], set)))
                continue;
            if(set.size === 0)
                continue;
            let equalCount = 1; // it's set to 1 not 0 because the set itself always counts as one.

            const otherCoords = [];
            for(const [coords2, set2] of dominoSets){
                if(set2 === set)
                    continue;
                // if there is any set that is a proper subset of the set you are trying to delete, then 
                // you cannot delete the set you were trying to delete... if you do, the proper subset would have no values.
                if(set2.size < set.size && set2.isSubsetOf(set))
                    continue nextSet;

                // if coords has only one direction cell and coords2 is the other cell, then don't double count that.
                const validDirections = validCellsToDirections.get(coords);

                // I don't know why this happens
                if(!validDirections)
                    continue;

                if(validDirections.length === 1){
                    const otherIndex = getOtherIndexString(coords, validDirections[0])
                    if(otherIndex.join(',') === coords2)
                        continue;
                }

                if(setsEqual(set, set2)){
                    ++equalCount;
                    otherCoords.push(coords2);
                }

                // could counting the dominoPlacements using the noRepeatDominoPlacements array fix this?
                if(equalCount > set.size)
                    return {type: INVALID_ARRANGEMENT};
            }
            if(equalCount === set.size){

                // okay to use has here since we want to comopare using pointers???
                // not sure, actually
                // if(!dominoSetsToDelete.has(set)){
                //     dominoSetsToDelete.add(set);
                //     newDominoSetsToDelete.add(set);
                // }
                //if(!dominoSetsToDelete.some(existingSet => setsEqual(existingSet, set) ))
                dominoSetsToDelete.push([[coords, ...otherCoords], set]);
            }
        }

        // delete the dominoes from these sets from all other sets.

        for(const [coordPairs, setToDelete] of dominoSetsToDelete){
            for(let [otherCoords, set] of dominoSets) {

                if(!setsEqual(set, setToDelete)){

                    nextValueToDelete: for(const value of setToDelete){

                        for(const coords of coordPairs){
                            const directions = dominoCellPairToDirections[coords + `${value[0]},${value[1]}`];
                            for (const direction of directions) {
                                const otherCoordsFromOriginal = getOtherIndexString(coords, direction);
                                if (otherCoords === `${otherCoordsFromOriginal[0]},${otherCoordsFromOriginal[1]}`)
                                    continue nextValueToDelete;
                            }
                        }

                        const oldSet = new Set(set);
                        // set = set.difference(setToDelete);

                        // // if you actually deleted something from this other set.
                        // if(!setsEqual(set, oldSet)){
                        //     deletedValue = true;
                        //     dominoesPerCell[otherCoords]= set;
                        // }
                        const removed = set.delete(value);
                        if(removed){
                            deletedValue = true;
                        }

                    }

                }
            }
        }
    }
    while(deletedValue)
}

export const updateDominoesPerCell = (placedDomino, [cell1, cell2], originalConditionsPointer, originalRegionsPointer) => {
    // is this thing necessary? Couldn't you just always run findMustBePlacedDominoes?
    let runUpdate = false;

    const surroundingCells = getSurroundingCells(cell1, cell2);
    for (const cell of surroundingCells) {
        const cellString = `${cell[0]},${cell[1]}`;
        const oldSet = new Set(dominoesPerCell[cellString]);
        dominoesPerCell[cellString] = new Set();
        // clear the dominoCellPairToDirections??

        // get all valid dominoes from the cell and just set this as the new dominoSet for the surrounding cell.
        // before calling this, do you need to ensure that the validIndices and foundDominoes were altered by the placement of the last domino?
        getDominoes(cell[0], cell[1], oldSet, originalConditionsPointer, originalRegionsPointer);

        const newSetLength = dominoesPerCell[cellString].size;
        //if (newSetLength < oldSet.size && newSetLength === 1)
        // don't check if size is 1 anymore because getEquivalentSets could discover something.
        if (newSetLength < oldSet.size)
            runUpdate = true;

    }
    for (const [coords, dominoSet] of Object.entries(dominoesPerCell)) {
        if (coords === cell1.join(',') || coords === cell2.join(',')) {
            dominoSet.clear();
            continue;
        }
        const deleted = dominoSet.delete(placedDomino)
        //if (deleted && dominoSet.size === 1)
        if (deleted)
            runUpdate = true;
    }
    if (runUpdate)
        //findMustBePlacedDominoes()
        getEquivalentSets();
}