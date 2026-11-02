
const findSingleCellDominoes = (dominoes, silenced = false) => {
    const foundAreasAndDominoes = [];
    let possibleDominoPlacementsSmallest = [];
    let possibleDominoPlacementsCurrent = [];

    const originalConditionsPointer = indicesToRegion;
    const originalRegionsPointer = regions;
    const originalValidCellsToDirectionsValue = new Map(validCellsToDirections);
    let minPossiblePlacementsCount = Infinity;

    // 
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