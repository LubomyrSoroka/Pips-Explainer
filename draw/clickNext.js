import { nextButton, nextForWrongPath, controls, INCORRECT, FOLLOWINGPLACEMENT, backButton, clickForward, clickBackward, BACKWARD } from './draw.js';
import { highlightCell, unhighlightCell } from './highlightCell.js';
import { waitForNextClick, lastDirection } from "./waitForNextClick.js";
import { drawStructure } from "./drawStructure.js";
import { invalidRoots, finalSolution, getOtherIndex } from "../explainer.js"
import { putDominoOnBoard, removeDomino } from './putDominoOnBoard.js';
import { placedCells } from './putDominoOnBoard.js';
import {drawArrow} from './drawInvalidArrow.js';

let lastHighlightedCurrent = null;
let currentIndex = -1;


export const resetCurrentIndex = () => {
    currentIndex = -1;
}

export let lastSinglePlacementCells = new Map();

let highlightedCell = null;
let lastHighlightedRedCell = null;
const highlightedCellsFromElimination = [];


const drawHighlightedCellsAndStructure = (additionalCellsThatGiveStructure, oneDirectionFromDominoEliminationCells, singlePlacementCells) => {
    if (additionalCellsThatGiveStructure)
        highlightedCell = highlightCell(additionalCellsThatGiveStructure, null, 'orange');
    //     highlightedCellsFromElimination.push(highlightCell(cell.split(',').map(Number), null, 'purple'));
    if (singlePlacementCells)
        drawStructure(singlePlacementCells);
    for (const json of oneDirectionFromDominoEliminationCells){
        const {cell, directions} = JSON.parse(json);
        drawArrow(cell, directions);
    }
}

export const clickNext = async (direction) => {
    nextButton.removeEventListener('click', clickForward);
    backButton.removeEventListener('click', clickBackward);

    if (highlightedCell)
        unhighlightCell(highlightedCell);
    for (const cell of highlightedCellsFromElimination)
        unhighlightCell(cell);

    currentIndex += direction;
    const { dominoEntry = undefined, reasoning = undefined, singlePlacementCells = [], additionalCellsThatGiveStructure = undefined, oneDirectionFromDominoEliminationCells = new Set() } = finalSolution[currentIndex !== -1 ? currentIndex : 0];


    if (currentIndex === -1)
        backButton.style.display = 'none';
    else
        backButton.style.display = 'block'



    const reasoningText = document.querySelector('#reasoning-text');
    const subReasoningText = document.querySelector('#sub-reasoning-text');
    subReasoningText.replaceChildren();
    reasoningText.textContent = reasoning;



    if (direction === BACKWARD) {
        // going backward moves you back one entry in finalSolution. So if you moved back but the one in front
        // which is really the current place you see visually didn't add any new dominoes, then don't delete the domino.
        if(currentIndex+1 < finalSolution.length && finalSolution[currentIndex + 1].dominoEntry)
            removeDomino(1);
    }
    else if(dominoEntry)
        putDominoOnBoard(dominoEntry);

    drawHighlightedCellsAndStructure(additionalCellsThatGiveStructure, oneDirectionFromDominoEliminationCells, singlePlacementCells);

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

    // if (direction === BACKWARD) {
    //     // what if on the last move, you only altered the structure but didn't remove any dominoes?
    //     // then you would have already exited the function by now.
    //     removeDomino(1);
    // }
    // else
    //     putDominoOnBoard(dominoEntry);

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
                unhighlightCell(lastHighlightedRedCell);
                subReasoningText.textContent = '';
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
                    // (it will be added by the proceeding code)

                    removeDomino(1);
                    firstCall = false;
                }
                let definitePlacementsCount = 0;
                putDominoOnBoard(child.value, INCORRECT);
                drawHighlightedCellsAndStructure(null, [], child.singlePlacementCells)

                for (const [index, placement] of (child.definitePlacements ?? []).entries()) {
                //for (const placement of child.definitePlacements ?? []) {
                    shouldExit = await waitForNextClick();
                    if (shouldExit) {
                        // nextButton.addEventListener('click', clickForward);
                        // backButton.addEventListener('click', clickBackward);
                        removeDomino(definitePlacementsCount + 1)
                        return;
                    }
                    ++definitePlacementsCount;
                    putDominoOnBoard(placement, FOLLOWINGPLACEMENT);

                    // retrieve the single placement cells from child.pastSinglePlacementCells
                    drawHighlightedCellsAndStructure(null, [], child?.pastSinglePlacementCells ? child?.pastSinglePlacementCells[index] : null);
                }
                // is it possible to have a reason but no cells to highlight?
                if (child?.reason) {
                    subReasoningText.textContent = child.reason;
                }
                if (child?.cells) {
                    for (const cell of child.cells) {
                        lastHighlightedRedCell = highlightCell(cell, null, 'red');
                    }
                }

                shouldExit = await waitForNextClick();
                if (shouldExit) {

                    unhighlightCell(lastHighlightedRedCell);

                    subReasoningText.textContent = '';
                    removeDomino(definitePlacementsCount + 1)
                    return;
                }
                await dfs(child);
                removeDomino(definitePlacementsCount + 1)
                unhighlightCell(lastHighlightedRedCell);
                subReasoningText.textContent = '';
                // but what if you should remove the non-definite placement before that as its the last one?
            }
        }
        const pseudoRoot = { children: invalidRoots[JSON.stringify(dominoEntry.cell)] };
        await dfs(pseudoRoot);
        // if you go through any of the alternate paths, then the original domino will have to be added back
        if (!exitedImmediately) {
            putDominoOnBoard(dominoEntry);
            // also add back any of the deleted placeholder dominoes.

            // need to pop out all placedCells that are removed.
            drawHighlightedCellsAndStructure(additionalCellsThatGiveStructure, oneDirectionFromDominoEliminationCells, singlePlacementCells)
        }
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