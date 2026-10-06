import { getOtherIndex } from "../explainer.js";
import { indicesToCellMap } from "./draw.js";
import { DOWN, UP, RIGHT, LEFT } from "../explainer.js"

export const highlightCell = (cell, direction = null, color = 'green') => {
    const cellElement = indicesToCellMap.get(typeof cell === 'string' ? cell : `${cell[0]},${cell[1]}`);
    const lastBorder = cellElement.style.border;
    cellElement.style.border = `3px solid ${color}`;
    let otherCellElement = null
    let lastOtherCellBorder = null
    if (direction) {
        const otherCell = getOtherIndex(typeof cell === 'string' ? cell.split(',').map(Number) : cell, direction);
        otherCellElement = indicesToCellMap.get(`${otherCell[0]},${otherCell[1]}`);
        lastOtherCellBorder = otherCellElement.style.border;
        otherCellElement.style.border = `3px solid ${color}`;
        switch (direction) {
            case DOWN:
                cellElement.style.borderBottom = 'transparent';
                otherCellElement.style.borderTop = 'transparent';
                break;
            case UP:
                cellElement.style.borderTop = 'transparent';
                otherCellElement.style.borderBottom = 'transparent';
                break;
            case RIGHT:
                cellElement.style.borderRight = 'transparent';
                otherCellElement.style.borderLeft = 'transparent';
                break;
            case LEFT:
                cellElement.style.borderLeft = 'transparent';
                otherCellElement.style.borderRight = 'transparent';
                break;
        }
    }
    const lastHighlightedCell = [{ cellElement, lastBorder }];
    if (otherCellElement) {
        lastHighlightedCell.push({ cellElement: otherCellElement, lastBorder: lastOtherCellBorder });
    }
    return lastHighlightedCell;
}


export const unhighlightCell = (lastHighlightedCell) => {
    lastHighlightedCell.forEach(cell => cell.cellElement.style.border = cell.lastBorder);
    lastHighlightedCell = null;
}

// const highlightWrongCell = (cell, direction = null) => {
//     const cellElement = indicesToCellMap.get(`${cell[0]},${cell[1]}`);
//     const lastBorder = cellElement.style.border;
//     cellElement.style.border = '3px solid red';
//     let otherCellElement = null
//     let lastOtherCellBorder = null
//     if (direction) {
//         const otherCell = getOtherIndex(cell, direction);
//         otherCellElement = indicesToCellMap.get(`${otherCell[0]},${otherCell[1]}`);
//         lastOtherCellBorder = otherCellElement.style.border;
//         otherCellElement.style.border = '3px solid red';
//         switch (direction) {
//             case DOWN:
//                 cellElement.style.borderBottom = 'transparent';
//                 otherCellElement.style.borderTop = 'transparent';
//                 break;
//             case UP:
//                 cellElement.style.borderTop = 'transparent';
//                 otherCellElement.style.borderBottom = 'transparent';
//                 break;
//             case RIGHT:
//                 cellElement.style.borderRight = 'transparent';
//                 otherCellElement.style.borderLeft = 'transparent';
//                 break;
//             case LEFT:
//                 cellElement.style.borderLeft = 'transparent';
//                 otherCellElement.style.borderRight = 'transparent';
//                 break;
//         }
//     }
//     if (lastHighlightedWrongCell)
//         lastHighlightedWrongCell.forEach(cell => cell.cellElement.style.border = cell.lastBorder);
//     lastHighlightedWrongCell = [{ cellElement, lastBorder }];
//     if (otherCellElement) {
//         lastHighlightedWrongCell.push({ cellElement: otherCellElement, lastBorder: lastOtherCellBorder });
//     }
// }
// const highlightWrongCell = (cell) => {
//     const lastBackgroundImage = indicesToCellMap.get(`${cell[0]},${cell[1]}`).style.backgroundImage;
//     indicesToCellMap.get(`${cell[0]},${cell[1]}`).style.backgroundImage = `
//     repeating-linear-gradient(
//             45deg,
//             red 0px,
//             red 5px,
//             transparent 5px,
//             transparent 15px
//         );
//     `
//     if (currentHighlightedWrongCell)
//         indicesToCellMap.get(`${currentHighlightedWrongCell.cell[0]},${currentHighlightedWrongCell.cell[1]}`).style.backgroundImage = currentHighlightedWrongCell.lastBackgroundImage;
//     currentHighlightedWrongCell = { cell, lastBackgroundImage };
// }
