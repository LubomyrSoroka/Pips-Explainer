
import {PLACEHOLDER } from "./draw.js";
import { putDominoOnBoard } from "./putDominoOnBoard.js";

export let lastSinglePlacementCells = new Set();
export let allSinglePlacementCells = new Set();

export const drawStructure = async (singlePlacementCells) => {
    const newSinglePlacementCells = singlePlacementCells.filter(([cell, direction]) => !lastSinglePlacementCells.has(cell));

    lastSinglePlacementCells = new Set(singlePlacementCells.map(([cell, direction]) => cell));

    newSinglePlacementCells.forEach(([cell, direction]) => allSinglePlacementCells.add(cell));

    for (const [cell, direction] of newSinglePlacementCells) {
        const dominoEntry = {
            cell: cell.split(',').map(Number),
            direction: direction[0],
        }

        putDominoOnBoard(dominoEntry, PLACEHOLDER);
    }

    // for (const cell of oneDirectionFromDominoEliminationCells) {
    //     const lastHighlightedCell = highlightCell(cell, null, 'yellow');
    //     await waitForNextClick(nextButton, nextForWrongPath);
    //     unhighlightCell(lastHighlightedCell);
    // }

}