
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
            cell.appendChild(innerCell);


            const cageIndex = cageMap.get(key);

            if (cageIndex !== undefined) {
                const cage = board[cageIndex];

                // addCageBorders(
                //     cell,
                //     row,
                //     col,
                //     cage,
                //     cageMap,
                //     cageIndex
                // );
            }

            boardElement.appendChild(cell);
        }
    }
}


function addCageBorders(
    cell,
    row,
    col,
    cage,
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
        cell.classList.add('cage-top');
    }

    if (cageMap.get(neighbors.bottom) !== cageIndex) {
        cell.classList.add('cage-bottom');
    }

    if (cageMap.get(neighbors.left) !== cageIndex) {
        cell.classList.add('cage-left');
    }

    if (cageMap.get(neighbors.right) !== cageIndex) {
        cell.classList.add('cage-right');
    }
}


createBoard(board);