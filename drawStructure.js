
import { putDominoOnBoard, PLACEHOLDER } from "./draw.js";
import { cellsToDirections } from "./explainer.js";

let lastSinglePlacementCells = new Set();
export let allSinglePlacementCells = new Set();

export const drawStructure = () => {
    const currentKnownDirections = cellsToDirections.shift();
    if (currentKnownDirections) {
        const singlePlacementCells = Array.from(currentKnownDirections).filter(([cell, directions]) => directions.length === 1).map(([cell, direction]) => cell);

        const newSinglePlacementCells = singlePlacementCells.filter((cell) => !lastSinglePlacementCells.has(cell));

        lastSinglePlacementCells = new Set(singlePlacementCells);

        newSinglePlacementCells.forEach(cell => { allSinglePlacementCells.add(cell) });

        for (const cell of newSinglePlacementCells) {
            const direction = currentKnownDirections.get(cell)[0];

            const dominoEntry = {
                cell: cell.split(',').map(Number),
                direction,
            }

            putDominoOnBoard(dominoEntry, PLACEHOLDER);
        }
    }
}