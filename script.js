
import { board } from "./explainer.js"

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


function getCageMap(board) {
    const map = new Map();

    board.forEach((cage, cageIndex) => {
        for (const [row, col] of cage.indices) {
            map.set(`${row},${col}`, cageIndex);
            const currentBadgeIndex = badgeIndices.get(cageIndex);
            if (!currentBadgeIndex)
                badgeIndices.set(cageIndex, [row, col])
            else if (currentBadgeIndex[0] < row)
                badgeIndices.set(cageIndex, [row, col])
            else if (currentBadgeIndex[0] === row && currentBadgeIndex[1] < col)
                badgeIndices.set(cageIndex, [row, col])
        }
    });

    return map;
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



function createBoard(board) {
    const boardElement = document.querySelector('#board');

    const { rows, cols } = getBoardSize(board);
    const cageMap = getCageMap(board);

    const cellSize = 80;

    boardElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    boardElement.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    boardElement.style.width = `${cols * cellSize}px`;
    boardElement.style.height = `${rows * cellSize}px`;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {

            const cell = document.createElement('div');
            cell.classList.add('cell');
            // instead of doing this, can you just "cut" all elements here and paste them in the reverse order?
            cell.style.zIndex = 10 - col - row;

            const key = `${row},${col}`;
            const cageIndex = cageMap.get(key);


            if (!possibleCells.has(key)) {
                cell.style.visibility = 'hidden';
            }

            const innerCell = document.createElement('div');
            innerCell.classList.add('innerCell')



            if (cageIndex !== undefined) {

                addCageBorders(
                    innerCell,
                    row,
                    col,
                    cageMap,
                    cageIndex
                );
            }

            cell.appendChild(innerCell);
            boardElement.appendChild(cell);

            if (badgeIndices.has(cageIndex) && badgeIndices.get(cageIndex)[0] === row && badgeIndices.get(cageIndex)[1] === col) {
                const badge = document.createElement('div')
                badge.classList.add('badge');

                cell.appendChild(badge);
                badge.style.right = 0;
                badge.style.bottom = 0;

                // const boardElement = document.querySelector('#board')
                // boardElement.appendChild(badge);
                // const coords = cell.getBoundingClientRect();
                // const boardCoords = boardElement.getBoundingClientRect();
                // badge.style.right = `${boardCoords.right - coords.right}px`
                // badge.style.bottom = `${boardCoords.bottom - coords.bottom}px`;

                const badgeText = document.createElement('span');
                badgeText.classList.add('badge-text');
                badgeText.innerText = getSymbol(board[cageIndex]);
                badge.appendChild(badgeText);
            }
        }
    }

}


function addCageBorders(
    cell,
    row,
    col,
    cageMap,
    cageIndex
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

    if (cageMap.get(neighbors.top) !== cageIndex) {
        const borderElement = document.createElement('div');
        borderElement.classList.add('border-top');
        cell.appendChild(borderElement);
        if (cageMap.get(neighbors.right) === cageIndex)
            borderElement.style.right = 0
        if (cageMap.get(neighbors.left) === cageIndex)
            borderElement.style.left = 0
    }

    if (cageMap.get(neighbors.bottom) !== cageIndex) {
        const borderElement = document.createElement('div');
        borderElement.classList.add('border-bottom');
        cell.appendChild(borderElement);
        if (cageMap.get(neighbors.right) === cageIndex)
            borderElement.style.right = 0
        if (cageMap.get(neighbors.left) === cageIndex)
            borderElement.style.left = 0
    }

    if (cageMap.get(neighbors.left) !== cageIndex) {
        const borderElement = document.createElement('div');
        borderElement.classList.add('border-left');
        cell.appendChild(borderElement);
        if (cageMap.get(neighbors.top) === cageIndex)
            borderElement.style.top = 0
        if (cageMap.get(neighbors.bottom) === cageIndex)
            borderElement.style.bottom = 0
    }

    if (cageMap.get(neighbors.right) !== cageIndex) {
        const borderElement = document.createElement('div');
        borderElement.classList.add('border-right');
        cell.appendChild(borderElement);
        if (cageMap.get(neighbors.top) === cageIndex)
            borderElement.style.top = 0
        if (cageMap.get(neighbors.bottom) === cageIndex)
            borderElement.style.bottom = 0
    }
}


createBoard(board);

const addDominoes = () => {

}