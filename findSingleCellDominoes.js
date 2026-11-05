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

export const updateDominoesPerCell = (placedDomino, [cell1, cell2]) => {
    let runUpdate = false;
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