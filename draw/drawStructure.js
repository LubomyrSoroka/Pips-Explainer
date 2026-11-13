
import { PLACEHOLDER, indicesToRegion } from "./draw.js";
import { putDominoOnBoard, placedCells, deleteByStringIndex } from "./putDominoOnBoard.js";
import { lastSinglePlacementCells } from "./clickNext.js";
import { getOtherIndex, getOtherIndexString, validIndices } from "../explainer.js";

export const drawStructure = async (singlePlacementCells) => {
    //const newSinglePlacementCells = singlePlacementCells.filter(([cell, direction]) => !lastSinglePlacementCells.has(cell));

    for (const [cell, direction] of singlePlacementCells) {
        // these cells are already strings
        if (placedCells.has(cell))
            continue;
        const dominoEntry = {
            cell: cell.split(',').map(Number),
            direction: direction[0],
        }
        putDominoOnBoard(dominoEntry, PLACEHOLDER);
    }

    const singlePlacementCellSet = new Set(singlePlacementCells.flatMap(([cell, direction]) => [cell, getOtherIndexString(cell, direction[0]).join(',')]));
    // go through all indices and delete the ones that may have had placeholder before but no longer do (if you are going backwards)
    for (const cell of indicesToRegion.keys()) {
        if (!singlePlacementCellSet.has(cell) && !placedCells.has(cell)) {
            deleteByStringIndex(cell);
        }
        // you can't do this because you can't get the direction...
        // const dominoEntry = {
        //     cell: cell.split(',').map(Number),
        //     direction: direction[0],
        // }
        // putDominoOnBoard(dominoEntry, PLACEHOLDER);
    }

    // if (newAddedPlaceholders.size > 0) {
    //     addedPlaceholders.push(newAddedPlaceholders);
    // }

}

// export const removePlaceholders = () => {
//     const placeholders = addedPlaceholders.pop();
//     for (const placeholder of placeholders) {
//         const [cell1DominoHalf, cell2DominoHalf] = placeholder;
//         cell1DominoHalf.remove();
//         cell2DominoHalf.remove();
//     }
// }