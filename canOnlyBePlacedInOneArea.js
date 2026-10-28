import { dominoes, updateStructure, validIndices, validCellsToDirections, check, adjustConditions, satisfiesRegionConditions, copyIndicesAndRegions, resetIndicesAndRegions, foundDominoes, finalSolution, getOtherIndex, isOutOfBoundsOrFilled, noRepeatPossibleDominoPlacements } from "./explainer.js"


export const rule_canOnlyBePlacedInOneArea = (originalConditionsPointer, originalRegionsPointer, silenced) => {

    const dominoToPlacements = [];
    // const originalConditionsPointer = indicesToRegion;
    // const originalRegionsPointer = regions;

    const foundPlacements = [];
    const foundAreasAndDominoes = [];
    for (const domino of dominoes) {
        if (foundDominoes.some(foundDomino => foundDomino[0] === domino[0] && foundDomino[1] === domino[1]))
            continue;
        for (const flip of [0, 1]) {
            // consider the domino in each orientation in each cell. Many times, one of the ends will be out of bounds (can obviously disqualify that)
            //for (const [[i, j], directions] of Array.from(noRepeatPossibleDominoPlacements.entries()).map(([key, direction]) => [key.split(',').map(Number), direction])) {
            for (const [cellString, directions] of noRepeatPossibleDominoPlacements.entries()) {
                const [i, j] = cellString.split(',').map(Number);
                if (isOutOfBoundsOrFilled(i, j))
                    continue;
                copyIndicesAndRegions(originalConditionsPointer, originalRegionsPointer);
                if (!satisfiesRegionConditions(i, j, flip ? domino[1] : domino[0]))
                    continue;
                adjustConditions([{ cell: [i, j], value: domino[flip ? 1 : 0] }]);

                for (const direction of directions) {
                    const otherIndices = getOtherIndex([i, j], direction)
                    // if(isOutOfBoundsOrFilled(otherIndices[0], otherIndices[1]))
                    //     continue;


                    let result = check(i, j, domino, direction, flip === 1);
                    if (result) {
                        dominoToPlacements[JSON.stringify(domino)] ??= [];
                        dominoToPlacements[JSON.stringify(domino)].push({ region: [i, j], flipped: flip, direction: direction });
                        // regionToPlacements[JSON.stringify([i, j])] ??= [];
                        // regionToPlacements[JSON.stringify([i, j])].push({ domino: domino, flipped: flip });
                    }
                }
            }
        }
    }

    for (const [domino, placements] of Object.entries(dominoToPlacements)) {
        // if it's 0, then the configuration is invalid... this can be a useful alternative to the current to add to checking invalid configs.

        // for an example of where this rule can be applied, consider Oct. 18, 2026 Easy. [4, 3] must go in the bottom with the 3 in the nine region.
        if (placements.length === 0) {
            return { type: INVALID_ARRANGEMENT, reason: `The domino ${domino} cannot be placed in any region` };

        }
        else if (placements.length === 1) {
            resetIndicesAndRegions(originalConditionsPointer, originalRegionsPointer);
            // place the domino at its only location.
            const dominoEntry = {
                cell: placements[0].region,
                flipped: placements[0].flipped,
                domino: JSON.parse(domino),
                direction: placements[0].direction,
            }

            let otherIndices = getOtherIndex(placements[0].region, placements[0].direction);
            let [index1, index2] = placements[0].flipped ? [1, 0] : [0, 1];
            adjustConditions([{ cell: placements[0].region, value: JSON.parse(domino)[index1] }, { cell: otherIndices, value: JSON.parse(domino)[index2] }]);
            // this value is used for checking if something is out of bounds.
            // but it is also used to check if a domino collides with another one.
            validIndices.delete(`${placements[0].region[0]},${placements[0].region[1]}`);
            validIndices.delete(`${otherIndices[0]},${otherIndices[1]}`);

            updateStructure(silenced);
            const placement = { dominoEntry, reasoning: `Added through rule_canOnlyBePlacedInOneArea` }
            if (!silenced) {
                finalSolution.push(placement);
            }
            foundPlacements.push(placement);
            foundAreasAndDominoes.push(dominoEntry);
            foundDominoes.push(JSON.parse(domino));
        }
        // imagine this scenario: one cell region has exactly two placements (including flips) and another region has the exact same two placements.
        // then if a third region has those two placements plus one more, you can remove those two placements that are used in the other regions.

        // one way to figure this out is to try to remove all the dominoes from one region: If you remove the first domino from that region, this implies
        // that you must place the other domino in the other region with only the two placements. Finally, this implies that in the region with three placements, you would have to put the other domino that's not in the other two regions.
        // if you done start off by removing the other domino from the first region, it would imply the same thing. Therefore, you can deduce the placement of the domino in the third region.

        // simpler situation: a region has two possibilities of a domino flipped. Another has a possiblity of either that domino or that another domino only one way flipped.
        // using the same process, you would deduce that the other region must use that other domino.
        // else {
        //     const dominoesRemovedInCommon = new Set();
        //     for (const regionToRemove of placements) {
        //         regionsToRemove = [regionToRemove];
        //         const dominoToPlacementsCopy = structuredClone(dominoToPlacements);
        //         let firstIteration = true;
        //         let dominoesRemoved = new Set();
        //         do {
        //             let currentRegion = regionsToRemove.pop();
        //             for (const [dominoCopy, placementsCopy] of dominoToPlacementsCopy) {

        //                 if (dominoCopy[0] === domino[0] && dominoCopy[1] === domino[1])
        //                     continue;
        //                 // should you also check that this domino isn't one that was already removed?
        //                 dominoToPlacementsCopy[dominoCopy] = placementsCopy.filter(({ region, flipped, direction }) => region !== currentRegion);
        //                 if (dominoToPlacementsCopy[dominoCopy].length === 1) {
        //                     regionsToRemove.push(dominoToPlacementsCopy[dominoCopy][0].region);
        //                     dominoesRemoved.add(JSON.stringify({ domino: dominoCopy[0], flipped: dominoToPlacementsCopy[dominoCopy][0].flipped, direction: dominoToPlacementsCopy[dominoCopy][0].direction, region: dominoToPlacementsCopy[dominoCopy][0].region }));
        //                     //dominoesRemoved.add(JSON.stringify(dominoCopy[0]));
        //                 }
        //             }
        //         } while (regionsToRemove.length > 0);

        //         if (firstIteration)
        //             dominoesRemovedInCommon = dominoesRemoved;
        //         else
        //             dominoesRemovedInCommon = dominoesRemovedInCommon.intersection(dominoesRemoved);
        //         firstIteration = false;
        //     }
        //     for (const dominoPlacement of dominoesRemovedInCommon) {
        //         const { domino, flipped, direction, region } = JSON.parse(dominoPlacement);
        //         foundPlacements.push({ dominoEntry: { cell: region, flipped, domino, direction }, reasoning: `Added through rule_canOnlyBePlacedInOneArea and because all placements of valid dominoes at ${region} imply these same placements` });
        //     }
        // }
    }

    resetIndicesAndRegions(originalConditionsPointer, originalRegionsPointer)
    //copyIndicesAndRegions(originalConditionsPointer, originalRegionsPointer);
    return { foundPlacements: foundAreasAndDominoes };
}

