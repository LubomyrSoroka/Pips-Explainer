
import { board } from "./explainer.js"

const possibleCells = new Set();

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
        }
    });

    return map;
}


function getSymbol(cage) {
    switch (cage.type) {
        case 'less':
            return '<';

        case 'greater':
            return '>';

        case 'sum':
            return '+';

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

            const key = `${row},${col}`;
            if (!possibleCells.has(key)) {
                cell.style.visibility = 'hidden';
            }

            const innerCell = document.createElement('div');
            innerCell.classList.add('innerCell')


            const cageIndex = cageMap.get(key);

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
        if(cageMap.get(neighbors.right) === cageIndex)
            borderElement.style.right = 0
        if(cageMap.get(neighbors.left) === cageIndex)
            borderElement.style.left = 0
    }

    if (cageMap.get(neighbors.bottom) !== cageIndex) {
        const borderElement = document.createElement('div');
        borderElement.classList.add('border-bottom');
        cell.appendChild(borderElement);
        if(cageMap.get(neighbors.right) === cageIndex)
            borderElement.style.right = 0
        if(cageMap.get(neighbors.left) === cageIndex)
            borderElement.style.left = 0
    }

    if (cageMap.get(neighbors.left) !== cageIndex) {
        const borderElement = document.createElement('div');
        borderElement.classList.add('border-left');
        cell.appendChild(borderElement);
        if(cageMap.get(neighbors.top) === cageIndex)
            borderElement.style.top = 0
        if(cageMap.get(neighbors.bottom) === cageIndex)
            borderElement.style.bottom = 0
    }

    if (cageMap.get(neighbors.right) !== cageIndex) {
        const borderElement = document.createElement('div');
        borderElement.classList.add('border-right');
        cell.appendChild(borderElement);
        if(cageMap.get(neighbors.top) === cageIndex)
            borderElement.style.top = 0
        if(cageMap.get(neighbors.bottom) === cageIndex)
            borderElement.style.bottom = 0
    }
}


createBoard(board);