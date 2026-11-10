import { indicesToRegion, regions, validCellsToDirections, dominoes, check, getOtherIndex, getOtherIndexString, adjustConditions, isOutOfBoundsOrFilled, foundDominoes, copyIndicesAndRegions, resetIndicesAndRegions, satisfiesRegionConditions } from "./explainer.js"

export const dominoesPerCell = {};

const dominoCellPairToDirections = {};

export const findSingleCellDominoes = () => {

    const originalConditionsPointer = indicesToRegion;
    const originalRegionsPointer = regions;

    const cellsToCheck = Array.from(validCellsToDirections.keys()).map(key => key.split(',').map(Number));
    nextCell: for (const [i, j] of cellsToCheck) {

        // this should check that you aren't placing the domino on a cell that already has a domino on it (not really checking that you're placing something out of bounds) 
        if (!validCellsToDirections.get(`${i},${j}`) || isOutOfBoundsOrFilled(i, j)) {
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
                        dominoCellPairToDirections[`${i},${j}` + `${domino[0]},${domino[1]}`] ??= new Set();
                        dominoCellPairToDirections[`${i},${j}` + `${domino[0]},${domino[1]}`].add(direction);

                    }

                }
            }
        }
    }
    resetIndicesAndRegions(originalConditionsPointer, originalRegionsPointer)
    findMustBePlacedDominoes();

}

const findMustBePlacedDominoes = () => {
    let i = 0;
    const dominoSets = Object.entries(dominoesPerCell);
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


export const updateDominoesPerCell = (placedDomino, [cell1, cell2], originalConditionsPointer, originalRegionsPointer) => {
    // is this thing necessary? Couldn't you just always run findMustBePlacedDominoes?
    let runUpdate = false;

    // this doesn't delete the possibilites from the actual physical blocking of placing the domino.

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
        if (newSetLength < oldSet.size && newSetLength === 1)
            runUpdate = true;

    }

    for (const [coords, dominoSet] of Object.entries(dominoesPerCell)) {
        if (coords === cell1.join(',') || coords === cell2.join(',')) {
            dominoSet.clear();
            continue;
        }
        const deleted = dominoSet.delete(placedDomino)
        if (deleted && dominoSet.size === 1)
            runUpdate = true;
    }
    if (runUpdate)
        findMustBePlacedDominoes()
}