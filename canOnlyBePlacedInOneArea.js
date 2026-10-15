// this rule rarely helps...
// dominoes is a 2D array. Each inner array is a pair of values, where the top value is the left of the domino and the bottom is the right of the domino(as they are shown horizontally when opening the game)

// class dominoToPlacement {
//     constructor()

// }

const dominoToPlacements = [];
const regionToPlacements = [];

const rule_canOnlyBePlacedInOneArea = (dominoes) => {
    // return where it can be placed (if there is really only one place) placeArea[0] is place of left and placeArea[1] is the place of the right.
    let placeArea = [];
    for (const domino of dominoes) {
        let placeCount = 0
        for (const flip of [0, 1]) {
            // consider the domino in each orientation in each cell. Many times, one of the ends will be out of bounds (can obviously disqualify that)
            for (const [i, j] of Array.from(validCellsToDirections.keys()).map(key => key.split(',').map(Number))) {
                if (!satisfiesRegionConditions(i, j, flip ? domino[1] : domino[0]))
                    continue;
                ({ indicesToRegion, regions } = structuredClone({ indicesToRegion: originalConditionsPointer, regions: originalRegionsPointer }));
                adjustConditions([{ cell: [i, j], value: domino[flip ? 1 : 0] }]);
                for (const direction of validCellsToDirections.get(`${i},${j}`)) {
                    let result = check(i, j, domino, direction, k === 1);
                    if (result) {
                        dominoToPlacements[JSON.stringify(domino)] ??= [];
                        dominoToPlacements[JSON.stringify(domino)].push({ region: [i, j], flipped: flip });
                        // regionToPlacements[JSON.stringify([i, j])] ??= [];
                        // regionToPlacements[JSON.stringify([i, j])].push({ domino: domino, flipped: flip });
                    }
                }
            }
        }
    }

    for (const [domino, placements] of dominoToPlacements.entries()) {
        // if it's 0, then the configuration is invalid... this can be a useful alternative to the current to add to checking invalid configs.

        if (placements.length === 1) {
            // place the domino at its only location.
        }
        // else if(dominoPlacmenets[domino].length === 2 && dominoPlacements[domino][0].region === dominoPlacements[domino][1].region){
        // }

        // imagine this scenario: one cell region has exactly two placements (including flips) and another region has the exact same two placements.
        // then if a third region has those two placements plus one more, you can remove those two placements that are used in the other regions.

        // one way to figure this out is to try to remove all the dominoes from one region: If you remove the first domino from that region, this implies
        // that you must place the other domino in the other region with only the two placements. Finally, this implies that in the region with three placements, you would have to put the other domino that's not in the other two regions.
        // if you done start off by removing the other domino from the first region, it would imply the same thing. Therefore, you can deduce the placement of the domino in the third region.

        // simpler situation: a region has two possibilities of a domino flipped. Another has a possiblity of either that domino or that another domino only one way flipped.
        // using the same process, you would deduce that the other region must use that other domino.
        else {
            dominoesRemovedInCommon = new Set();
            for (const regionToRemove of placements) {
                regionsToRemove = [regionToRemove];
                const dominoToPlacementsCopy = structuredClone(dominoToPlacements);
                do {
                    let currentRegion = regionsToRemove.pop();
                    for (const [dominoCopy, placementsCopy] of dominoToPlacementsCopy) {

                        if (dominoCopy[0] === domino[0] && dominoCopy[1] === domino[1])
                            continue;
                        dominoToPlacementsCopy[dominoCopy] = placementsCopy.filter(({ region, flipped }) => region !== currentRegion);
                        if (dominoToPlacementsCopy[dominoCopy].length === 1) {
                            regionsToRemove.push(dominoToPlacementsCopy[dominoCopy][0].region);
                        }
                        // if the length is 0, then would that imply that the placement of the domino in this region isn't possible?
                        // if that region just had a single placement, then it would've been placed already. But what about more complicated scenarios?
                    }
                    // for (const) {
                    // }
                } while (regionsToRemove.length > 0);
            }

        }
    }

    // if there is no place to put the cell, then either something is wrong with the puzzle (this shouldn't be possible if it's an official puzzle)
    // or you had placed an earlier cell incorrectly.
    if (placeCount == 0)
        return false;
    return placeArea;
}

