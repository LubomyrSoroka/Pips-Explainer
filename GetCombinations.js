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

import { dominoPartCounts } from "./explainer.js";


const SUM = 'sum';
const GREATER = 'greater';
const LESS = 'less';

export const getCombinations = (target, numberOfCells, type = SUM) => {
    const minNumberOfPipsUsed = {};
    const unusedPipsValues = new Set([0, 1, 2, 3, 4, 5, 6]);
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
                // if (Object.keys(combinationObject).some(value => Number(value) > 6)) {
                combinations.delete(combination);
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

//console.log(getCombinationsWithSet(0, 3))