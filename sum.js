
import { board } from "./explainer.js"
let unplacedDominoSum = 0

const getUnplacedDominoSum = () => {
    for (const domino of dominoes) {
        if (foundDominoes.has(domino))
            continue;
        getUnplacedDominoSum += domino[0] + domino[1];
    }
}

export const getBoardSumRange = () => {
    let minSum = 0;
    let maxSum = 0;
    for (const region of board) {
        if (region.type === 'sum') {
            minSum += region.target;
            maxSum += region.target;
        }
        if (region.type === 'greater') {
            minSum += region.target + 1;
            // if you don't have enough 6s or 5s, then the max sum may be smaller.
            maxSum += region.indices.length * 6;
        }
        if (region.type === 'less') {
            maxSum += region.target - 1;
            // if you don't have any 0's then the min sum may be greater.
            // minSum += 0 
        }
        // else { // if the region is 'equals' or 'unequals' or blank then treat it as an unknown.
        //     // if it's an equal region of 3 cells, for example, then you have a 3x in the inequality.
        // }
    }
    return { minSum, maxSum };

}

const findOtherRegionsSums = () => {
    const summands = [];
    for (const region of board) {
        // let evaluatedMin = minSum;
        // let evaluatedMax = maxSum;
        if (region.type === 'equals') {
            summands.push(region.target.map(target => target * region.indices.length));
        }

        else if (region.type === 'blank') {
            summands.push([0, 1, 2, 3, 4, 5, 6])
        }
        else if (region.type === 'set') {
            // all the sums that you can make from the set given the number of cells in the region.
            // the quantity should be (size of set) choose (number of cells in region).
            summands.push()
        }
    }
    //const summands = regions.filter((region) => region.type === 'equals').map((region) => region.target);

    const sums = summands.reduce(
        (results, array) =>
            results.flatMap(({ sum, values }) =>
                array.map(value => ({
                    sum: sum + value,
                    values: [...values, value]
                }))
            ),
        [{ sum: 0, values: [] }]
    );
    const validCombinations = sums.filter((result) => result.sum <= unplacedDominoSum - minSum && result.sum >= unplacedDominoSum - maxSum)

    // then set the equals regions to the matching values
    if (validCombinations.length === 1) {

    }
    // later, can see if there are more things implied from this.
}

export const getUnknownsExpression = () => {
    let expr = [];
    let equalsIndex = 0, blankIndex = 0, setIndex = 0;
    for (const region of board) {
        if (region.type === 'equals') {
            expr.push(`${region.indices.length}x<sub>${equalsIndex++}</sub>`)
        }
        else if (region.type === 'blank') {
            expr.push(`y<sub>${blankIndex++}</sub>`)
        }
        else if (region.type === 'set') {
            // all the sums that you can make from the set given the number of cells in the region.
            // the quantity should be (size of set) choose (number of cells in region).
            expr.push(`z<sub>${setIndex++}</sub>`)
        }
    }
    return expr.join(' + ');
}