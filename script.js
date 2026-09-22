
import { board } from "./explainer.js"
import { dominoes } from "./explainer.js"
import { finalSolution } from "./explainer.js"
import { getOtherIndex } from "./explainer.js";
import { invalidRoots } from "./explainer.js";


const possibleCells = new Set();

// the indices that correspond to the cell that should have the badge for a region
// this goes to the cell which is lowest in the region. For cells which are equally low, take the right-most cell.
const badgeIndices = new Map();

function getBoardSize(board) {
    let maxRow = 0;
    let maxCol = 0;

    for (const cell of board) {
        for (const [row, col] of cell.indices) {
            possibleCells.add(`${row},${col}`);
            maxRow = Math.max(maxRow, row);
            maxCol = Math.max(maxCol, col);
        }
    }

    return {
        rows: maxRow + 1,
        cols: maxCol + 1
    };
}


const indicesToRegion = new Map();

function getRegionMap(board) {
    board.forEach((cage, cageIndex) => {
        // take the set difference of available colors and the colors of the neighbors.

        for (const [row, col] of cage.indices) {
            indicesToRegion.set(`${row},${col}`, cageIndex);
            const currentBadgeIndex = badgeIndices.get(cageIndex);
            if (!currentBadgeIndex)
                badgeIndices.set(cageIndex, [row, col])
            else if (currentBadgeIndex[0] < row)
                badgeIndices.set(cageIndex, [row, col])
            else if (currentBadgeIndex[0] === row && currentBadgeIndex[1] < col)
                badgeIndices.set(cageIndex, [row, col])
        }
    });
}

const regionToColor = new Map();
const colors = new Set(['red', 'green', 'blue', 'purple', 'orange']);
const getNeighbouringRegions = (region) => {
    const neighbourSet = new Set()
    for (const [row, col] of region.indices) {
        if (indicesToRegion.get(`${row + 1},${col}`) && indicesToRegion.get(`${row + 1},${col}`) !== region)
            neighbourSet.add(indicesToRegion.get(`${row + 1},${col}`));

        if (indicesToRegion.get(`${row - 1},${col}`) && indicesToRegion.get(`${row - 1},${col}`) !== region)
            neighbourSet.add(indicesToRegion.get(`${row - 1},${col}`));

        if (indicesToRegion.get(`${row},${col + 1}`) && indicesToRegion.get(`${row},${col + 1}`) !== region)
            neighbourSet.add(indicesToRegion.get(`${row},${col + 1}`));

        if (indicesToRegion.get(`${row},${col - 1}`) && indicesToRegion.get(`${row},${col - 1}`) !== region)
            neighbourSet.add(indicesToRegion.get(`${row},${col - 1}`));
    }

    return neighbourSet;

}

const setColors = () => {
    board.forEach((region, regionIndex) => {
        const neighbourSet = getNeighbouringRegions(region);
        const neighborColors = new Set(Array.from(neighbourSet).map(neighborIndex => regionToColor.get(neighborIndex)))
        const availableColors = colors.difference(neighborColors);
        const regionColor = [...availableColors][Math.floor(Math.random() * availableColors.size)];
        regionToColor.set(regionIndex, regionColor);
    })
}

function getSymbol(cage) {
    switch (cage.type) {
        case 'less':
            return '<' + cage.target;

        case 'greater':
            return '>' + cage.target;

        case 'sum':
            return cage.target;

        case 'equals':
            return '=';

        default:
            return '';
    }
}

const indicesToCellMap = new Map();
const cellSize = 60;

function createBoard(board) {
    const boardElement = document.querySelector('#board');

    const { rows, cols } = getBoardSize(board);


    boardElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    boardElement.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    boardElement.style.width = `${cols * cellSize}px`;
    boardElement.style.height = `${rows * cellSize}px`;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            const key = `${row},${col}`;
            const cell = document.createElement('div');
            cell.classList.add('cell');
            indicesToCellMap.set(key, cell);


            // instead of doing this, can you just "cut" all elements here and paste them in the reverse order?
            //cell.style.zIndex = 10 - col - row;
            //const cageIndex = cageMap.get(key);


            if (!possibleCells.has(key)) {
                cell.style.visibility = 'hidden';
            }

            // const innerCell = document.createElement('div');
            // indicesToCellMap.set(key, cell);
            // indicesToInnerCellMap.set(key, innerCell);
            // innerCell.classList.add('innerCell')

            const regionIndex = indicesToRegion.get(key);

            const tintElement = document.createElement('div');
            tintElement.classList.add('tint');
            tintElement.style.backgroundColor = `color-mix(in srgb, ${regionToColor.get(regionIndex)} 30%, transparent)`;
            cell.appendChild(tintElement);

            if (regionIndex !== undefined) {
                addCageBorders(
                    cell,
                    row,
                    col,
                    regionIndex
                );
            }


            // need to append first so that that getClientBoundingRect gives right coords (in both cases?)
            //cell.appendChild(innerCell);
            boardElement.appendChild(cell);

            if (badgeIndices.has(regionIndex) && badgeIndices.get(regionIndex)[0] === row && badgeIndices.get(regionIndex)[1] === col) {
                const badge = document.createElement('div')
                badge.classList.add('badge');

                // to add element under cell 
                // cell.appendChild(badge);
                // badge.style.right = 0;
                // badge.style.bottom = 0;
                // badge.style.backgroundColor = regionToColor.get(regionIndex);

                // to add element directly to board
                const boardElement = document.querySelector('#board')
                boardElement.appendChild(badge);
                const coords = cell.getBoundingClientRect();
                const boardCoords = boardElement.getBoundingClientRect();
                badge.style.right = `${boardCoords.right - coords.right}px`
                badge.style.bottom = `${boardCoords.bottom - coords.bottom}px`;
                badge.style.backgroundColor = regionToColor.get(regionIndex);
                badge.style.zIndex = 10;

                const badgeText = document.createElement('span');
                badgeText.classList.add('badge-text');
                badgeText.innerText = getSymbol(board[regionIndex]);
                badge.appendChild(badgeText);
            }

        }
    }
}

function addCageBorders(
    cell,
    row,
    col,
    cageIndex,
) {
    const neighbors = {
        top: `${row - 1},${col}`,
        bottom: `${row + 1},${col}`,
        left: `${row},${col - 1}`,
        right: `${row},${col + 1}`
    };
    /*
     * If the neighboring cell isn't in the same cage,
     * this cell is on the outside edge of the cage.
     */

    if (indicesToRegion.get(neighbors.top) !== cageIndex) {

        //const borderElement = document.createElement('div');
        // borderElement.classList.add('border-top');
        // cell.appendChild(borderElement);
        // if (cageMap.get(neighbors.right) === cageIndex)
        //     borderElement.style.right = 0
        // if (cageMap.get(neighbors.left) === cageIndex)
        //     borderElement.style.left = 0
        cell.style.borderTop = `1px solid ${regionToColor.get(cageIndex)}`;
        // cell.style.borderLeft = '3px solid red';
        // cell.style.borderRight = '3px solid red';
    }

    if (indicesToRegion.get(neighbors.bottom) !== cageIndex) {
        // const borderElement = document.createElement('div');
        // borderElement.classList.add('border-bottom');
        // cell.appendChild(borderElement);
        // if (cageMap.get(neighbors.right) === cageIndex)
        //     borderElement.style.right = 0
        // if (cageMap.get(neighbors.left) === cageIndex)
        //     borderElement.style.left = 0
        cell.style.borderBottom = `1px solid ${regionToColor.get(cageIndex)}`;
    }

    if (indicesToRegion.get(neighbors.left) !== cageIndex) {
        // const borderElement = document.createElement('div');
        // borderElement.classList.add('border-left');
        // cell.appendChild(borderElement);
        // if (cageMap.get(neighbors.top) === cageIndex)
        //     borderElement.style.top = 0
        // if (cageMap.get(neighbors.bottom) === cageIndex)
        //     borderElement.style.bottom = 0
        cell.style.borderLeft = `1px solid ${regionToColor.get(cageIndex)}`;
    }

    if (indicesToRegion.get(neighbors.right) !== cageIndex) {
        // const borderElement = document.createElement('div');
        // borderElement.classList.add('border-right');
        // cell.appendChild(borderElement);
        // if (cageMap.get(neighbors.top) === cageIndex)
        //     borderElement.style.top = 0
        // if (cageMap.get(neighbors.bottom) === cageIndex)
        //     borderElement.style.bottom = 0
        cell.style.borderRight = `1px solid ${regionToColor.get(cageIndex)}`;
    }
}



const dominoMap = new Map();

const addDominoes = (dominoes) => {
    const dominoesElement = document.querySelector('#dominoes');
    for (const domino of dominoes) {

        const dominoElement = document.createElement('div');
        // what if there are two dominoes which are identicial (rare)
        const leftSide = document.createElement('div');
        const rightSide = document.createElement('div');
        leftSide.style.borderRight = '1px solid black';
        leftSide.textContent = domino[0];
        rightSide.textContent = domino[1];
        leftSide.classList.add('pips');
        rightSide.classList.add('pips');
        dominoMap.set(JSON.stringify(domino), dominoElement);
        dominoElement.appendChild(leftSide);
        dominoElement.appendChild(rightSide);
        dominoElement.classList.add('domino');
        dominoesElement.appendChild(dominoElement);
    }
}

// window.addEventListener('added-first-domino', () => {
//     const controls = document.querySelector('#controls');
//     const nextButton = document.createElement('button');
//     nextButton.textContent = 'Next';
//     controls.appendChild(nextButton);
//     nextButton.addEventListener('click', () => {

//     });
// });

const nextButton = document.querySelector('#next');

const waitForNextClick = (button) => {
    return new Promise(resolve => {
        button.addEventListener('click', resolve, { once: true });
    });
};

const clickNext = async () => {
    const dominoEntry = finalSolution[0];
    finalSolution.shift();
    putDominoOnBoard(dominoEntry);
    if (finalSolution.length === 0) {
        controls.replaceChildren();
        const doneText = document.createElement('span');
        doneText.textContent = 'Solved!';
        controls.appendChild(doneText);
    }
    if (invalidRoots[JSON.stringify(dominoEntry.area)].length > 0) {
        const nextForWrongPath = document.querySelector('#next-for-wrong-path');
        nextForWrongPath.style.display = 'block';

        const dfs = async (root) => {
            if (root.children.length === 0) {
                return;
            }
            for (const child of root.children) {
                await waitForNextClick(nextForWrongPath);
                const [cell1DominoHalf, cell2DominoHalf] = putDominoOnBoard(child.value);
                await dfs(child);
                // remove the domino from the board
                cell1DominoHalf.remove();
                cell2DominoHalf.remove();

            }
        }

        for (const root of invalidRoots[JSON.stringify(dominoEntry.area)]) {
            await dfs(root);
        }

    }
}
nextButton.addEventListener('click', clickNext);



const putDominoOnBoard = (dominoEntry) => {
    const dominoElement = dominoMap.get(JSON.stringify(dominoEntry.domino));

    /*
    const copy = dominoElement.cloneNode(true)
    let rotation = 0;
    // rotations are clockwise
    switch (dominoEntry.direction) {
        case 'left':
            rotation = 180;
            break;
        case 'right':
            rotation = 0;
            break;
        case 'up':
            rotation = 270;
            break;
        case 'down':
            rotation = 90;
            break;
    }
    */

    dominoElement.style.backgroundColor = 'grey';
    dominoElement.style.border = 'none';
    dominoElement.replaceChildren();

    const cell1 = indicesToCellMap.get(`${dominoEntry.area[0]},${dominoEntry.area[1]}`)
    const cell1DominoHalf = document.createElement('div');
    cell1DominoHalf.classList.add('domino-half');


    const otherIndices = getOtherIndex(
        dominoEntry.area,
        dominoEntry.direction
    );

    const cell2 = indicesToCellMap.get(
        `${otherIndices[0]},${otherIndices[1]}`
    );
    const cell2DominoHalf = document.createElement('div');
    cell2DominoHalf.classList.add('domino-half');

    // Set up both cells
    for (const cell of [cell1DominoHalf, cell2DominoHalf]) {
        cell.style.backgroundColor = 'white';
        cell.style.borderTop = '2px solid black';
        cell.style.borderBottom = '2px solid black';
        cell.style.borderRight = '2px solid black';
        cell.style.borderLeft = '2px solid black';
        cell.style.borderTopLeftRadius = 'var(--border-radius)';
        cell.style.borderBottomLeftRadius = 'var(--border-radius)';
        cell.style.borderTopRightRadius = 'var(--border-radius)';
        cell.style.borderBottomRightRadius = 'var(--border-radius)';
    }

    // Add the domino values
    cell1DominoHalf.append(
        dominoEntry.domino[dominoEntry.flipped ? 1 : 0]
    );

    cell2DominoHalf.append(
        dominoEntry.domino[dominoEntry.flipped ? 0 : 1]
    );

    // Remove the border between the two cells
    switch (dominoEntry.direction) {
        case 'up':
            cell1DominoHalf.style.borderTop = '2px solid transparent';
            cell2DominoHalf.style.borderBottom = '2px solid transparent';
            cell1DominoHalf.style.borderTopLeftRadius = '0';
            cell1DominoHalf.style.borderTopRightRadius = '0';
            cell2DominoHalf.style.borderBottomLeftRadius = '0';
            cell2DominoHalf.style.borderBottomRightRadius = '0';
            break;

        case 'down':
            cell1DominoHalf.style.borderBottom = '2px solid transparent';
            cell2DominoHalf.style.borderTop = '2px solid transparent';
            cell1DominoHalf.style.borderBottomLeftRadius = '0';
            cell1DominoHalf.style.borderBottomRightRadius = '0';
            cell2DominoHalf.style.borderTopLeftRadius = '0';
            cell2DominoHalf.style.borderTopRightRadius = '0';
            break;

        case 'right':
            cell1DominoHalf.style.borderRight = '2px solid transparent';
            cell2DominoHalf.style.borderLeft = '2px solid transparent';
            cell1DominoHalf.style.borderTopRightRadius = '0';
            cell1DominoHalf.style.borderBottomRightRadius = '0';
            cell2DominoHalf.style.borderTopLeftRadius = '0';
            cell2DominoHalf.style.borderBottomLeftRadius = '0';
            break;

        case 'left':
            cell1DominoHalf.style.borderLeft = '2px solid transparent';
            cell2DominoHalf.style.borderRight = '2px solid transparent';
            cell1DominoHalf.style.borderTopLeftRadius = '0';
            cell1DominoHalf.style.borderBottomLeftRadius = '0';
            cell2DominoHalf.style.borderTopRightRadius = '0';
            cell2DominoHalf.style.borderBottomRightRadius = '0';
            break;
    }

    // the next two methods work by copying the exisitng element and appending it.
    // to append to the inner cell: 
    // copy.style.left = 0 + 'px';
    // copy.style.top = 0 + 'px';
    // copy.style.margin = 0 + 'px';
    // copy.style.position = 'absolute';
    // copy.style.transformOrigin = `${cellSize / 2}px ${cellSize / 2}px`;
    // copy.style.transform = 'rotate(' + rotation + 'deg)';
    // copy.style.zIndex = -1;
    // cell1.appendChild(copy);

    //to append to the board: 
    // const boardElement = document.querySelector('#board');
    // const cell1Coords = cell1.getBoundingClientRect();
    // const boardCoords = boardElement.getBoundingClientRect();
    // copy.style.position = 'absolute';
    // copy.style.margin = 0 + 'px';
    // copy.style.left = cell1Coords.left - boardCoords.left + 'px';
    // copy.style.top = cell1Coords.top - boardCoords.top + 'px';
    // copy.style.zIndex = 5;
    // copy.style.transformOrigin = `${cellSize / 2}px ${cellSize / 2}px`;
    // copy.style.transform = 'rotate(' + rotation + 'deg)';

    cell1.append(cell1DominoHalf);
    cell2.append(cell2DominoHalf);
    return [cell1DominoHalf, cell2DominoHalf];

}

getRegionMap(board);
setColors();
createBoard(board);
addDominoes(dominoes);

// depth order:
// board backgroudn (darker brown)

// condition badge
// inner cell (but not by other cells inner cells)
