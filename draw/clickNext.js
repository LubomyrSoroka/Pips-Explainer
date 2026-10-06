import { nextButton, nextForWrongPath, controls, INCORRECT, FOLLOWINGPLACEMENT, backButton, clickForward, clickBackward, BACKWARD} from './draw.js';
import { highlightCell, unhighlightCell } from './highlightCell.js';
import { waitForNextClick, shouldExit } from "./waitForNextClick.js";
import { drawStructure, allSinglePlacementCells } from "./drawStructure.js";
import { invalidRoots, finalSolution } from "../explainer.js"
import { putDominoOnBoard, removeDomino } from './putDominoOnBoard.js';

let lastHighlightedCurrent = null;
let lastSinglePlacementCells = null;
let currentIndex = -1;

export const clickNext = async (direction) => {
    nextButton.removeEventListener('click', clickForward );
    backButton.removeEventListener('click', clickBackward );

    currentIndex += direction; 
    const { dominoEntry, reasoning, singlePlacementCells } = finalSolution[currentIndex !== -1 ? currentIndex : 0];
    if(currentIndex === -1)
        backButton.style.display = 'none';
    else
        backButton.style.display = 'block'

    if(direction === BACKWARD){
        removeDomino(1);
        nextButton.addEventListener('click', clickForward );
        backButton.addEventListener('click', clickBackward );
        return;
    }
    
    if (singlePlacementCells && singlePlacementCells.length > 0 && (!lastSinglePlacementCells || JSON.stringify(singlePlacementCells) !== JSON.stringify(lastSinglePlacementCells))) {
        drawStructure(singlePlacementCells);
        await waitForNextClick(nextButton);
    }

    lastSinglePlacementCells = singlePlacementCells || lastSinglePlacementCells;
    const reasoningText = document.querySelector('#reasoning-text');
    const subReasoningText = document.querySelector('#sub-reasoning-text');
    subReasoningText.replaceChildren();
    reasoningText.textContent = reasoning;

    putDominoOnBoard(dominoEntry);

    if (finalSolution.length === 0) {
        controls.replaceChildren();
        const doneText = document.createElement('span');
        doneText.textContent = 'Solved!';
        controls.appendChild(doneText);
    }

    if (lastHighlightedCurrent)
        unhighlightCell(lastHighlightedCurrent);

    lastHighlightedCurrent = highlightCell(dominoEntry.cell, allSinglePlacementCells.has(`${dominoEntry.cell[0]},${dominoEntry.cell[1]}`) ? dominoEntry.direction : null);

    if (invalidRoots[JSON.stringify(dominoEntry.cell)] && invalidRoots[JSON.stringify(dominoEntry.cell)].length > 0) {
        nextForWrongPath.style.display = 'block';
        const dfs = async (root) => {
            if (root.children.length === 0) {
                return;
            }
            for (const [index, child] of root.children.entries()) {
                if (index === 0) {
                    await waitForNextClick(nextForWrongPath, nextButton);
                }
                let definitePlacementsCount = child?.definitePlacements?.length;
                subReasoningText.textContent = '';
                putDominoOnBoard(child.value, INCORRECT);

                for (const placement of child.definitePlacements ?? []) {
                    await waitForNextClick(nextForWrongPath, nextButton);
                    putDominoOnBoard(placement, FOLLOWINGPLACEMENT);
                }
                // is it possible to have a reason but no cells to highlight?
                if (child?.reason) {
                    subReasoningText.textContent = child.reason;
                }
                if (child?.cells) {
                    let lastHighlightedCell;
                    for (const cell of child.cells) {
                        lastHighlightedCell = highlightCell(cell, null, 'red');
                    }
                    //await waitForNextClick(nextForWrongPath, nextButton);

                    unhighlightCell(lastHighlightedCell);
                    subReasoningText.textContent = '';
                }

                await waitForNextClick(nextForWrongPath, nextButton);
                if (shouldExit) {
                    clickNext();
                    nextButton.addEventListener('click', clickForward);
                    return;
                }
                //highlightCell(child.value.cell);
                await dfs(child);
                removeDomino(definitePlacementsCount + 1)
            }
        }
        for (const root of invalidRoots[JSON.stringify(dominoEntry.cell)]) {
            await waitForNextClick(nextForWrongPath, nextButton);
            if (shouldExit) {
                clickNext();
                nextButton.addEventListener('click', clickForward);
                return;
            }
            removeDomino(1);
            putDominoOnBoard(root.value, INCORRECT);
            const definitePlacementsCount = root?.defniitePlacments?.length;
            for (const placement of root.definitePlacements ?? []) {
                await waitForNextClick(nextForWrongPath, nextButton);
                putDominoOnBoard(placement, FOLLOWINGPLACEMENT);
            }

            if (root?.reason) {
                const subReasoningText = document.querySelector('#sub-reasoning-text');
                subReasoningText.textContent = root.reason;
            }
            if (root?.cells) {
                let lastHighlightedWrongCell;
                for (const cell of root.cells) {
                    lastHighlightedWrongCell = highlightCell(cell, null, 'red');
                }
                await waitForNextClick(nextForWrongPath, nextButton);
                unhighlightCell(lastHighlightedWrongCell);
                subReasoningText.textContent = '';
            }

            await dfs(root);
            removeDomino(definitePlacementsCount + 1)
        }
        nextForWrongPath.style.display = 'none';
        putDominoOnBoard(dominoEntry);
    }
    else {
        nextForWrongPath.style.display = 'none';
    }
    putDominoOnBoard(dominoEntry);

    backButton.addEventListener('click', clickBackward );
    nextButton.addEventListener('click', clickForward);
}