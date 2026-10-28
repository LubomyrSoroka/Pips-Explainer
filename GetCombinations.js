// given a sum region, calculate all the combinations of pip values that can produce that sum.
// e.g. for 8 with 2 cells you have 2+6, 3+5 and 4+4 (assuming that you currently have dominoHalves with these values).

// const sums = {
//     0: [0, 0],
//     1: [0, 1],
//     2: [[0, 2], [1, 1]],
//     3: [[0, 3], [1, 2]],
//     4: [[0, 4], [1, 3], [2, 2]],
//     5: [[0, 5], [1, 4], [2, 3]],
//     6: [[0, 6], [1, 5], [2, 4], [3, 3]],
//     7: [[1, 6], [2, 5], [3, 4]],
//     8: [[2, 6], [3, 5], [4, 4]],
//     9: [[3, 6], [4, 5]],
//     10: [[4, 6], [5, 5]],
//     11: [[5, 6]],
//     12: [[6, 6]]
// }

// const getCombinations = (sum, numberOfCells) => {
//     let numberOfSummands = 2;
//     let combinations = [];

//     for (let i = 0; i <= Math.floor(sum / 2); ++i) {
//         combinations.push([sum - i, i]);
//     }

//     let nextCombinations = [];
//     while (numberOfSummands < numberOfCells) {
//         combinations.forEach((combination) => {
//             if (combination.slice(1).some(value => value > 6))
//                 return;
//             for (let i = 0; i <= Math.floor(combination[0] / 2); ++i) {
//                 nextCombinations.push([combination[0] - i, i, ...combination.slice(1)]);
//             }
//         })
//         combinations = [...nextCombinations];
//         nextCombinations = [];
//         ++numberOfSummands;
//     }

//     combinations = combinations.filter(combination => !combination.some(value => value > 6));
//     return combinations;
// }

//console.log(JSON.stringify(getCombinations(18, 4), null, 2));

import {
    dominoPartCounts, regions, alterOneCombinationRegion,
    validCellsToDirections
} from "./explainer.js";


const SUM = 'sum';
const GREATER = 'greater';
const LESS = 'less';

export const getCombinations = (target, numberOfCells, type = SUM) => {
    const minNumberOfPipsUsed = {};
    let unusedPipsValues = new Set([0, 1, 2, 3, 4, 5, 6]);
    for (let i = 0; i <= 6; ++i) {
        minNumberOfPipsUsed[i] = Infinity;
    }

    let targets = [];
    switch (type) {
        case SUM:
            targets = [target];
            break;
        case GREATER:
            for (let i = target + 1; i <= numberOfCells * 6; ++i) {
                targets.push(i);
            }
            break;
        case LESS:
            for (let i = 0; i < target; ++i) {
                targets.push(i);
            }
            break;
    }
    let totalCombinations = new Set();
    for (const target of targets) {
        let numberOfSummands = 2;
        let combinations = new Set();
        for (let i = 0; i <= Math.floor(target / 2); ++i) {
            if (target - i === i) {
                combinations.add(JSON.stringify({ [i]: 2 }));
            } else {
                combinations.add(JSON.stringify({ [target - i]: 1, [i]: 1 }));
            }
        }

        while (numberOfSummands < numberOfCells) {
            Array.from(combinations).forEach((combination) => {
                combinations.delete(combination);
                let combinationObjectOriginal = JSON.parse(combination);
                let maxKey = -1;
                let numberKeysOverSix = 0;
                for (const key of Object.keys(combinationObjectOriginal).map(Number)) {
                    if (key > maxKey)
                        maxKey = key;
                    if (key > 6)
                        numberKeysOverSix++;
                    if (numberKeysOverSix > 1)
                        return;
                }

                for (let i = 0; i <= Math.floor(maxKey / 2); ++i) {
                    let combinationObject = { ...combinationObjectOriginal }
                    combinationObject[maxKey] -= 1;
                    if (combinationObject[maxKey] === 0)
                        delete combinationObject[maxKey];
                    combinationObject[i] = (combinationObject[i] ?? 0) + 1;
                    combinationObject[maxKey - i] = (combinationObject[maxKey - i] ?? 0) + 1;
                    combinations.add(JSON.stringify(combinationObject))
                }
            })
            ++numberOfSummands;
        }


        for (const combination of combinations) {
            let combinationObject = JSON.parse(combination);
            // if this is an invalid combination or we don't have enough of a certain value, then disqualify this.
            if (Object.keys(combinationObject).some(value => Number(value) > 6 || combinationObject[value] > dominoPartCounts[value])) {
                //if (Object.keys(combinationObject).some(value => Number(value) > 6)) {
                combinations.delete(combination);
                continue;
            }
            for (let i = 0; i <= 6; ++i) {
                minNumberOfPipsUsed[i] = Math.min(minNumberOfPipsUsed[i], combinationObject[i] ?? 0);
            }
            unusedPipsValues = unusedPipsValues.difference(new Set(Object.keys(combinationObject).map(Number)))
        }

        totalCombinations = new Set([...totalCombinations, ...combinations]);
    }
    return { totalCombinations, minNumberOfPipsUsed, unusedPipsValues };
}


// assumes previous valid combinations and the new pip value that you added.
export const updateCombinations = (previousCombinations, addedValue, oldMinPipCounts = null) => {
    if (!previousCombinations)
        return;
    let newCombinations = new Set();
    let unusedPipsValues = new Set([0, 1, 2, 3, 4, 5, 6]);
    for (const combination of previousCombinations) {
        const combinationObject = JSON.parse(combination);
        if (combinationObject[addedValue] > 0) {
            const newObject = { ...combinationObject, [addedValue]: combinationObject[addedValue] - 1 }
            if (newObject[addedValue] === 0)
                delete newObject[addedValue];
            newCombinations.add(JSON.stringify(newObject))
        }
    }

    // const minPipCounts = {}
    // for (let i = 0; i <= 6; ++i)
    //     minPipCounts[i] = Infinity;

    // for (const combination of newCombinations) {
    //     let combinationObject = JSON.parse(combination);
    //     unusedPipsValues = unusedPipsValues.difference(new Set(Object.keys(combinationObject).map(Number)));
    //     for (let i = 0; i <= 6; ++i)
    //         minPipCounts[i] = Math.min(minPipCounts[i], combinationObject[i] ?? 0);
    // }

    // let modifiedDominoPartCounts = false;
    // for (let i = 0; i <= 6; ++i) {
    //     const difference = minPipCounts[i] - oldMinPipCounts[i];
    //     if(difference > 0)
    //         modifiedDominoPartCounts = true; 
    //     dominoPartCounts[i] -= difference;
    // }


    for (const combination of newCombinations) {
        let combinationObject = JSON.parse(combination);
        unusedPipsValues = unusedPipsValues.difference(new Set(Object.keys(combinationObject).map(Number)));
    }

    // return whether you modified the dominoPartCounts.
    // after the calling function receives this, should it call removeCombinations right away, or should it way until
    // you call adjustconditions on the second cell?
    //return { newCombinations, unusedPipsValues, minPipCounts, modifiedDominoPartCounts };
    return { newCombinations, unusedPipsValues };
}


export const removeCombinations = () => {
    // if using any of the combinations causes you to go over the count for that pip,
    // then you can remove that combination. You could then attempt to count the minimum pip counts,
    const combinationRegions = regions.filter(region => region.combinations);
    let regionsToCheck = combinationRegions;
    //let regionToCheck = regionToCheck.values.next();

    while (regionsToCheck.length > 0) {
        const combinationRegion = regionsToCheck.pop();
        const oldMinPipCounts = structuredClone(combinationRegion.minNumberOfPipsUsed);
        let deleted = false;
        for (const combination of combinationRegion.combinations) {
            const combinationObject = JSON.parse(combination);

            for (const [pipsValue, numberOfPips] of Object.entries(combinationObject)) {

                if (dominoPartCounts[pipsValue] - numberOfPips < 0) {
                    combinationRegion.combinations.delete(combination);
                    deleted = true;
                }

            }

        }

        if (combinationRegion.combinations.size === 1) {
            // checks if the combination is one pip value multiple times. If so, then it adds the 1 cell regions
            //alterOneCombinationRegion(combinationRegion.combinations, combinationRegion.indices);
            //const onlyCombo = JSON.parse(combinationRegion.combinations.values().next().value);
            // for (const region of combinationRegions) {
            //     // should I be comparing the stringifed versions of these?
            //     if (region !== combinationRegion)
            //         regionsToCheck.add(region);
            // }
        }

        if (deleted) {
            for (let i = 0; i <= 6; ++i) {
                combinationRegion.minNumberOfPipsUsed[i] = Infinity;
            }
            for (const combination of combinationRegion.combinations) {
                for (let i = 0; i <= 6; ++i)
                    combinationRegion.minNumberOfPipsUsed[i] = Math.min(combinationRegion.minNumberOfPipsUsed[i], JSON.parse(combination)[i] ?? 0);
            }

            combinationRegion.unusedPipsValues = new Set([0, 1, 2, 3, 4, 5, 6]);
            for (const combination of combinationRegion.combinations) {
                combinationRegion.unusedPipsValues = combinationRegion.unusedPipsValues.difference(new Set(Object.keys(JSON.parse(combination)).map(Number)));
            }

            // now you need to recount the pip counts with the new minNumberOfPipsUsed.
            // if the pip counts change, then you need to check the other regions to see if any of them need to have any of their combinations removed.
            // reset the regions to be all available regions. The end of the loop will remove the current region.
            let shouldCheckRegionsAgain = false;
            for (let i = 0; i <= 6; ++i) {
                const difference = combinationRegion.minNumberOfPipsUsed[i] - oldMinPipCounts[i];
                if (difference > 0)
                    shouldCheckRegionsAgain = true;
                dominoPartCounts[i] -= difference;
            }
            if (shouldCheckRegionsAgain)
                // are you sure !== will work properly here?
                regionsToCheck = combinationRegions.filter(region => region !== combinationRegion);
        }

    }
}