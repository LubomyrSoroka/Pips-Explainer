import { nextButton, nextForWrongPath, controls, INCORRECT, FOLLOWINGPLACEMENT, backButton, clickForward, clickBackward, BACKWARD } from './draw.js';
import { highlightCell, unhighlightCell } from './highlightCell.js';
import { waitForNextClick, lastDirection } from "./waitForNextClick.js";
import { drawStructure } from "./drawStructure.js";
import { invalidRoots, finalSolution } from "../explainer.js"
import { putDominoOnBoard, removeDomino } from './putDominoOnBoard.js';


let lastHighlightedCurrent = null;
let currentIndex = -1;


export const resetCurrentIndex = () => {
    currentIndex = -1;
}

export let lastSinglePlacementCells = new Map();

let highlightedCell = null;
const highlightedCellsFromElimination = [];

export const clickNext = async (direction) => {
    nextButton.removeEventListener('click', clickForward);
    backButton.removeEventListener('click', clickBackward);

    if (highlightedCell)
        unhighlightCell(highlightedCell);
    for (const cell of highlightedCellsFromElimination)
        unhighlightCell(cell);

    currentIndex += direction;
    const { dominoEntry = undefined, reasoning = undefined, singlePlacementCells = new Map(), additionalCellsThatGiveStructure = undefined, oneDirectionFromDominoEliminationCells = new Set() } = finalSolution[currentIndex !== -1 ? currentIndex : 0];
    if (currentIndex === -1)
        backButton.style.display = 'none';
    else
        backButton.style.display = 'block'



    const reasoningText = document.querySelector('#reasoning-text');
    const subReasoningText = document.querySelector('#sub-reasoning-text');
    subReasoningText.replaceChildren();
    reasoningText.textContent = reasoning;


    if (singlePlacementCells && singlePlacementCells.length > 0 && (lastSinglePlacementCells.size === 0 || singlePlacementCells.some(([cell, direction]) => !lastSinglePlacementCells.has(cell)))) {
        if (additionalCellsThatGiveStructure)
            highlightedCell = highlightCell(additionalCellsThatGiveStructure, null, 'orange');
        for (const cell of oneDirectionFromDominoEliminationCells)
            highlightedCellsFromElimination.push(highlightCell(cell.split(',').map(Number), null, 'purple'));
        drawStructure(singlePlacementCells);

        // if (!dominoEntry)
        //     await waitForNextClick(nextButton);
        for (const [cell, entry] of singlePlacementCells) {
            lastSinglePlacementCells.set(cell, entry);
        }
    }


    if (dominoEntry) {
        if (lastHighlightedCurrent)
            unhighlightCell(lastHighlightedCurrent);
        lastHighlightedCurrent = highlightCell(dominoEntry.cell, lastSinglePlacementCells.has(`${dominoEntry.cell[0]},${dominoEntry.cell[1]}`) ? dominoEntry.direction : null);
    }
    else {
        nextButton.addEventListener('click', clickForward);
        backButton.addEventListener('click', clickBackward);
        return;
    }

    if (direction === BACKWARD)
        removeDomino(1);
    else
        putDominoOnBoard(dominoEntry);

    // if (finalSolution.length === 0) {
    //     controls.replaceChildren();
    //     const doneText = document.createElement('span');
    //     doneText.textContent = 'Solved!';
    //     controls.appendChild(doneText);
    // }


    // clicking both back and forward in the middle of an alternate path just takes you to the current correct placement (they do the same thing)
    // is this a good implementation?
    if (invalidRoots[JSON.stringify(dominoEntry.cell)] && invalidRoots[JSON.stringify(dominoEntry.cell)].length > 0) {
        nextForWrongPath.style.display = 'block';
        let firstCall = true;
        let exitedImmediately = false;
        let shouldExit = false;
        const dfs = async (root) => {
            if (root.children.length === 0) {
                return;
            }
            for (const [index, child] of root.children.entries()) {
                if (shouldExit)
                    return;
                if (firstCall) {
                    shouldExit = await waitForNextClick();
                    if (shouldExit) {
                        // nextButton.addEventListener('click', clickForward);
                        // backButton.addEventListener('click', clickBackward);
                        exitedImmediately = true;
                        //clickNext(lastDirection);
                        return;
                    }
                    // remove the correct domino and add the first invalid one in its place.
                    removeDomino(1);
                    // (it will be added by the proceeding code)
                    firstCall = false;
                }
                let definitePlacementsCount = 0;
                subReasoningText.textContent = '';
                putDominoOnBoard(child.value, INCORRECT);

                for (const placement of child.definitePlacements ?? []) {
                    shouldExit = await waitForNextClick();
                    if (shouldExit) {
                        // nextButton.addEventListener('click', clickForward);
                        // backButton.addEventListener('click', clickBackward);
                        removeDomino(definitePlacementsCount + 1)
                        return;
                    }
                    ++definitePlacementsCount;
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
                    unhighlightCell(lastHighlightedCell);
                    subReasoningText.textContent = '';
                }

                shouldExit = await waitForNextClick();
                if (shouldExit) {
                    // after calling clickNext it places the current? domimo only to have it immediately removed from the call right after dfs here.
                    // nextButton.addEventListener('click', clickForward);
                    // backButton.addEventListener('click', clickBackward);
                    removeDomino(definitePlacementsCount + 1)
                    return;
                }
                await dfs(child);
                removeDomino(definitePlacementsCount + 1)
                // but what if you should remove the non-definite placement before that as its the last one?
            }
        }
        const pseudoRoot = { children: invalidRoots[JSON.stringify(dominoEntry.cell)] };
        await dfs(pseudoRoot);
        // if you go through any of the alternate paths, then the original domino will have to be added back
        if (!exitedImmediately)
            putDominoOnBoard(dominoEntry);
        // if not, then click next (but don't add the listeners back already or you will click twice) 
        else {
            clickNext(lastDirection)
            return;
        }

    }
    else {
        nextForWrongPath.style.display = 'none';
    }

    backButton.addEventListener('click', clickBackward);
    nextButton.addEventListener('click', clickForward);
}