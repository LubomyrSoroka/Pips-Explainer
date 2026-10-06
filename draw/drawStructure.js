
import { PLACEHOLDER } from "./draw.js";
import { putDominoOnBoard } from "./putDominoOnBoard.js";
import { lastSinglePlacementCells } from "./clickNext.js";

export const drawStructure = async (singlePlacementCells) => {
    const newSinglePlacementCells = singlePlacementCells.filter(([cell, direction]) => !lastSinglePlacementCells.has(cell));

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