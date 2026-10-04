import { board } from "./explainer.js"
import { dominoes } from "./explainer.js"
import { finalSolution } from "./explainer.js"
import { getOtherIndex } from "./explainer.js";
import { invalidRoots } from "./explainer.js";
import { initialDominoPartCounts } from "./explainer.js";
import { pipCountToHtml } from "./pip-html.js";
import { pipCountToHtmlFlipped } from "./pip-html.js";
import { getBoardSumRange, getUnknownsExpression } from "./sum.js";
import { allSinglePlacementCells } from "./drawStructure.js";


import { UP, DOWN, LEFT, RIGHT } from './explainer.js';

import { drawStructure } from './drawStructure.js';

const NORMAL = 'normal';
const INCORRECT = 'incorrect';
export const PLACEHOLDER = 'placeholder';
const FOLLOWINGPLACEMENT = 'following placement';

export let putDominoOnBoard;

export const draw = () => {
    const nextButton = document.createElement('button');
    nextButton.id = "next-button";
    nextButton.textContent = "Next";

    const nextForWrongPath = document.createElement('button');
    nextForWrongPath.id = "next-button-for-wrong-path";
    nextForWrongPath.textContent = "Next (wrong path)";
    nextForWrongPath.style.display = 'none';

    const controls = document.querySelector("#controls");
    controls.replaceChildren();

    controls.appendChild(nextButton);
    controls.appendChild(nextForWrongPath);

    const boardElement = document.querySelector('#board');
    boardElement.replaceChildren();
    const dominoesElement = document.querySelector('#dominoes');
    dominoesElement.replaceChildren();

    const partCountsElement = document.querySelector('#part-counts');
    partCountsElement.replaceChildren();

    const sumsElements = document.querySelector('#sums')
    sumsElements.replaceChildren();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextButton.click();
        }
    })

    const setPartCounts = () => {
        Object.entries(initialDominoPartCounts).forEach(([index, count]) => {
            const partCountElement = document.createElement('div');
            partCountElement.textContent = `${index}: ${count}`;
            partCountsElement.appendChild(partCountElement);
        })
        const dominoSumsElement = document.createElement('div');

        const pipsSum = Object.entries(initialDominoPartCounts).reduce((acc, curr) => acc + curr[0] * curr[1], 0);
        dominoSumsElement.textContent = `Sum of all pips on all dominoes: ${pipsSum}`;
        sumsElements.appendChild(dominoSumsElement);

        const { minSum, maxSum } = getBoardSumRange();
        const boardSumRangeElement = document.createElement('div');
        boardSumRangeElement.innerHTML = `Board sum range: ${minSum} + ${getUnknownsExpression()} &le; ${pipsSum} &le; ${maxSum} + ${getUnknownsExpression()}`;
        sumsElements.appendChild(boardSumRangeElement);
    }

    const possibleCells = new Set();

    // the indices that correspond to the cell that should have the badge for a region
    // this goes to the cell which is lowest in the region. For cells which are equally low, take the right-most cell.
    const badgeIndices = new Map();

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


    const indicesToRegion = new Map();

    function getRegionMap(board) {
        board.forEach((region, regionIndex) => {
            // take the set difference of available colors and the colors of the neighbors.

            for (const [row, col] of region.indices) {
                indicesToRegion.set(`${row},${col}`, regionIndex);
                const currentBadgeIndex = badgeIndices.get(regionIndex);
                if (region.type === 'empty')
                    continue;
                if (!currentBadgeIndex)
                    badgeIndices.set(regionIndex, [row, col])
                else if (currentBadgeIndex[0] < row)
                    badgeIndices.set(regionIndex, [row, col])
                else if (currentBadgeIndex[0] === row && currentBadgeIndex[1] < col)
                    badgeIndices.set(regionIndex, [row, col])
            }
        });
    }

    const regionToColor = new Map();
    const colors = new Set(['red', 'green', 'blue', 'purple', 'orange']);
    const getNeighbouringRegions = (region, regionIndex) => {
        const neighbourSet = new Set()
        for (const [row, col] of region.indices) {
            if (indicesToRegion.get(`${row + 1},${col}`) !== undefined && indicesToRegion.get(`${row + 1},${col}`) !== regionIndex)
                neighbourSet.add(indicesToRegion.get(`${row + 1},${col}`));

            if (indicesToRegion.get(`${row - 1},${col}`) !== undefined && indicesToRegion.get(`${row - 1},${col}`) !== regionIndex)
                neighbourSet.add(indicesToRegion.get(`${row - 1},${col}`));

            if (indicesToRegion.get(`${row},${col + 1}`) !== undefined && indicesToRegion.get(`${row},${col + 1}`) !== regionIndex)
                neighbourSet.add(indicesToRegion.get(`${row},${col + 1}`));

            if (indicesToRegion.get(`${row},${col - 1}`) !== undefined && indicesToRegion.get(`${row},${col - 1}`) !== regionIndex)
                neighbourSet.add(indicesToRegion.get(`${row},${col - 1}`));
        }
        return neighbourSet;
    }

    const setColors = () => {
        board.forEach((region, regionIndex) => {
            if (region.type === 'empty') {
                regionToColor.set(regionIndex, null)
                return;
            }
            const neighbourSet = getNeighbouringRegions(region, regionIndex);
            const neighborColors = new Set(Array.from(neighbourSet).map(neighborIndex => regionToColor.get(neighborIndex)))
            const availableColors = colors.difference(neighborColors);
            const regionColor = [...availableColors][Math.floor(Math.random() * availableColors.size)];
            regionToColor.set(regionIndex, regionColor);
        })
    }

    function getSymbol(cage) {
        switch (cage.type) {
            case 'less':
                return '<' + cage.target;

            case 'greater':
                return '>' + cage.target;

            case 'sum':
                return cage.target;

            case 'equals':
                return '=';

            case 'set':
                return '≠';
            default:
                return '';
        }
    }

    const indicesToCellMap = new Map();
    const cellSize = 60;

    function createBoard(board) {
        const boardElement = document.querySelector('#board');

        const { rows, cols } = getBoardSize(board);


        boardElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
        boardElement.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
        boardElement.style.width = `${cols * cellSize}px`;
        boardElement.style.height = `${rows * cellSize}px`;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {

                const key = `${row},${col}`;
                const cell = document.createElement('div');
                cell.classList.add('cell');
                indicesToCellMap.set(key, cell);


                // instead of doing this, can you just "cut" all elements here and paste them in the reverse order?
                //cell.style.zIndex = 10 - col - row;
                //const cageIndex = cageMap.get(key);


                if (!possibleCells.has(key)) {
                    cell.style.visibility = 'hidden';
                }

                // const innerCell = document.createElement('div');
                // indicesToCellMap.set(key, cell);
                // indicesToInnerCellMap.set(key, innerCell);
                // innerCell.classList.add('innerCell')

                const regionIndex = indicesToRegion.get(key);

                if (regionToColor.get(regionIndex)) {
                    const tintElement = document.createElement('div');
                    tintElement.classList.add('tint');
                    tintElement.style.backgroundColor = `color-mix(in srgb, ${regionToColor.get(regionIndex)} 30%, transparent)`;
                    cell.appendChild(tintElement);
                }

                if (regionIndex !== undefined) {
                    addCageBorders(
                        cell,
                        row,
                        col,
                        regionIndex
                    );
                }


                // need to append first so that that getClientBoundingRect gives right coords (in both cases?)
                //cell.appendChild(innerCell);
                boardElement.appendChild(cell);

                if (badgeIndices.has(regionIndex) && badgeIndices.get(regionIndex)[0] === row && badgeIndices.get(regionIndex)[1] === col) {
                    const badge = document.createElement('div')
                    badge.classList.add('badge');

                    // to add element under cell 
                    // cell.appendChild(badge);
                    // badge.style.right = 0;
                    // badge.style.bottom = 0;
                    // badge.style.backgroundColor = regionToColor.get(regionIndex);

                    // to add element directly to board
                    const boardElement = document.querySelector('#board')
                    boardElement.appendChild(badge);
                    const coords = cell.getBoundingClientRect();
                    const boardCoords = boardElement.getBoundingClientRect();
                    badge.style.right = `${boardCoords.right - coords.right}px`
                    badge.style.bottom = `${boardCoords.bottom - coords.bottom}px`;
                    badge.style.backgroundColor = regionToColor.get(regionIndex);
                    badge.style.zIndex = 10;

                    const badgeText = document.createElement('span');
                    badgeText.classList.add('badge-text');
                    badgeText.innerText = getSymbol(board[regionIndex]);
                    badge.appendChild(badgeText);
                }

            }
        }
    }

    function addCageBorders(
        cell,
        row,
        col,
        cageIndex,
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

        if (indicesToRegion.get(neighbors.top) !== cageIndex) {

            //const borderElement = document.createElement('div');
            // borderElement.classList.add('border-top');
            // cell.appendChild(borderElement);
            // if (cageMap.get(neighbors.right) === cageIndex)
            //     borderElement.style.right = 0
            // if (cageMap.get(neighbors.left) === cageIndex)
            //     borderElement.style.left = 0
            cell.style.borderTop = `1px solid ${regionToColor.get(cageIndex)}`;
            // cell.style.borderLeft = '3px solid red';
            // cell.style.borderRight = '3px solid red';
        }

        if (indicesToRegion.get(neighbors.bottom) !== cageIndex) {
            // const borderElement = document.createElement('div');
            // borderElement.classList.add('border-bottom');
            // cell.appendChild(borderElement);
            // if (cageMap.get(neighbors.right) === cageIndex)
            //     borderElement.style.right = 0
            // if (cageMap.get(neighbors.left) === cageIndex)
            //     borderElement.style.left = 0
            cell.style.borderBottom = `1px solid ${regionToColor.get(cageIndex)}`;
        }

        if (indicesToRegion.get(neighbors.left) !== cageIndex) {
            // const borderElement = document.createElement('div');
            // borderElement.classList.add('border-left');
            // cell.appendChild(borderElement);
            // if (cageMap.get(neighbors.top) === cageIndex)
            //     borderElement.style.top = 0
            // if (cageMap.get(neighbors.bottom) === cageIndex)
            //     borderElement.style.bottom = 0
            cell.style.borderLeft = `1px solid ${regionToColor.get(cageIndex)}`;
        }

        if (indicesToRegion.get(neighbors.right) !== cageIndex) {
            // const borderElement = document.createElement('div');
            // borderElement.classList.add('border-right');
            // cell.appendChild(borderElement);
            // if (cageMap.get(neighbors.top) === cageIndex)
            //     borderElement.style.top = 0
            // if (cageMap.get(neighbors.bottom) === cageIndex)
            //     borderElement.style.bottom = 0
            cell.style.borderRight = `1px solid ${regionToColor.get(cageIndex)}`;
        }
    }



    const dominoMap = new Map();

    const addDominoes = (dominoes) => {
        const dominoesElement = document.querySelector('#dominoes');
        for (const domino of dominoes) {

            const dominoElement = document.createElement('div');
            // what if there are two dominoes which are identicial (rare)
            createHalves(dominoElement, domino);
            dominoesElement.appendChild(dominoElement);
        }
    }

    const createHalves = (dominoElement, domino) => {
        const leftSide = document.createElement('div');
        const rightSide = document.createElement('div');
        leftSide.style.borderRight = '1px solid black';
        if (domino[0] !== 0)
            leftSide.innerHTML = pipCountToHtml[domino[0]];
        if (domino[1] !== 0)
            rightSide.innerHTML = pipCountToHtml[domino[1]];

        leftSide.classList.add('pips');
        rightSide.classList.add('pips');
        dominoMap.set(JSON.stringify(domino), dominoElement);
        dominoElement.appendChild(leftSide);
        dominoElement.appendChild(rightSide);
        dominoElement.classList.add('domino');
    }
    // window.addEventListener('added-first-domino', () => {
    //     const controls = document.querySelector('#controls');
    //     const nextButton = document.createElement('button');
    //     nextButton.textContent = 'Next';
    //     controls.appendChild(nextButton);
    //     nextButton.addEventListener('click', () => {

    //     });
    // });

    //const nextButton = document.querySelector('#next');
    let shouldExit = false;

    const waitForNextClick = (button, nextForWrongPathButton = null) => {
        return new Promise(resolve => {
            button.addEventListener('click',
                () => {
                    shouldExit = false;
                    resolve();
                }
                , { once: true });
            if (nextForWrongPathButton) {
                nextForWrongPathButton.addEventListener('click',
                    () => {
                        shouldExit = true;
                        //unhighlightCell(CURRENT_CELL);
                        unhighlightCell(WRONG_CELL);
                        resolve();
                    }
                    , { once: true });
            }
        });
    };


    let lastHighlightedCell = null;
    let lastHighlightedWrongCell = null;

    const CURRENT_CELL = 'current_cell';
    const WRONG_CELL = 'wrong_cell';

    const highlightCell = (cell, direction = null) => {
        const cellElement = indicesToCellMap.get(`${cell[0]},${cell[1]}`);
        const lastBorder = cellElement.style.border;
        cellElement.style.border = '3px solid green';
        let otherCellElement = null
        let lastOtherCellBorder = null
        if (direction) {
            const otherCell = getOtherIndex(cell, direction);
            otherCellElement = indicesToCellMap.get(`${otherCell[0]},${otherCell[1]}`);
            lastOtherCellBorder = otherCellElement.style.border;
            otherCellElement.style.border = '3px solid green';
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
        if (lastHighlightedCell)
            lastHighlightedCell.forEach(cell => cell.cellElement.style.border = cell.lastBorder);

        lastHighlightedCell = [{ cellElement, lastBorder }];
        if (otherCellElement) {
            lastHighlightedCell.push({ cellElement: otherCellElement, lastBorder: lastOtherCellBorder });
        }
    }

    const highlightWrongCell = (cell, direction = null) => {
        const cellElement = indicesToCellMap.get(`${cell[0]},${cell[1]}`);
        const lastBorder = cellElement.style.border;
        cellElement.style.border = '3px solid red';
        let otherCellElement = null
        let lastOtherCellBorder = null
        if (direction) {
            const otherCell = getOtherIndex(cell, direction);
            otherCellElement = indicesToCellMap.get(`${otherCell[0]},${otherCell[1]}`);
            lastOtherCellBorder = otherCellElement.style.border;
            otherCellElement.style.border = '3px solid red';
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
        if (lastHighlightedWrongCell)
            lastHighlightedWrongCell.forEach(cell => cell.cellElement.style.border = cell.lastBorder);

        lastHighlightedWrongCell = [{ cellElement, lastBorder }];
        if (otherCellElement) {
            lastHighlightedWrongCell.push({ cellElement: otherCellElement, lastBorder: lastOtherCellBorder });
        }
    }

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


    const unhighlightCell = (cellType = CURRENT_CELL) => {
        if (cellType === CURRENT_CELL) {
            if (lastHighlightedCell) {
                lastHighlightedCell.forEach(cell => cell.cellElement.style.border = cell.lastBorder);
                lastHighlightedCell = null;
            }
        }
        else if (cellType === WRONG_CELL) {
            if (lastHighlightedWrongCell) {
                lastHighlightedWrongCell.forEach(cell => cell.cellElement.style.border = cell.lastBorder);
                lastHighlightedWrongCell = null;
            }
        }
        else {
            throw new Error('Invalid cell type');
        }
    }


    const clickNext = async () => {
        drawStructure();
        await waitForNextClick(nextButton);
        const { dominoEntry, reasoning } = finalSolution[0];
        finalSolution.shift();
        const [originalcell1DominoHalf, originalcell2DominoHalf] = putDominoOnBoard(dominoEntry);
        const reasoningText = document.querySelector('#reasoning-text');
        const subReasoningText = document.querySelector('#sub-reasoning-text');
        subReasoningText.replaceChildren();
        reasoningText.textContent = reasoning;

        if (finalSolution.length === 0) {
            controls.replaceChildren();
            const doneText = document.createElement('span');
            doneText.textContent = 'Solved!';
            controls.appendChild(doneText);
        }

        highlightCell(dominoEntry.cell, allSinglePlacementCells.has(`${dominoEntry.cell[0]},${dominoEntry.cell[1]}`) ? dominoEntry.direction : null);
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
                    const definitePlacements = [];
                    const [cell1DominoHalf, cell2DominoHalf] = putDominoOnBoard(child.value, INCORRECT);
                    for (const placement of child.definitePlacements) {
                        await waitForNextClick(nextForWrongPath, nextButton);
                        let dominoElement = dominoMap.get(JSON.stringify(placement.domino));
                        dominoElement.style.background = 'grey';
                        dominoElement.style.border = 'none';
                        definitePlacements.push([...putDominoOnBoard(placement, FOLLOWINGPLACEMENT), placement.domino]);
                    }
                    // is it possible to have a reason but no cells to highlight?
                    if (child?.reason) {
                        subReasoningText.textContent = child.reason;
                    }
                    if (child?.cells) {
                        for (const cell of child.cells) {
                            highlightWrongCell(cell);
                        }
                        await waitForNextClick(nextForWrongPath, nextButton);
                        unhighlightCell(WRONG_CELL);
                        subReasoningText.textContent = '';
                    }
                    if (shouldExit) {
                        return;
                    }
                    //highlightCell(child.value.cell);
                    await dfs(child);
                    removeDomino(cell1DominoHalf, cell2DominoHalf, child.value.domino);
                    for (const placement of definitePlacements) {
                        removeDomino(placement[0], placement[1], placement[2]);
                    }
                }
            }
            for (const root of invalidRoots[JSON.stringify(dominoEntry.cell)]) {
                await waitForNextClick(nextForWrongPath, nextButton);
                if (shouldExit) {
                    return;
                }
                const [cell1DominoHalf, cell2DominoHalf] = putDominoOnBoard(root.value, INCORRECT);
                removeDomino(originalcell1DominoHalf, originalcell2DominoHalf, dominoEntry.domino);
                const definitePlacements = [];
                for (const placement of root.definitePlacements) {
                    await waitForNextClick(nextForWrongPath, nextButton);
                    let dominoElement = dominoMap.get(JSON.stringify(placement.domino));
                    dominoElement.style.background = 'grey';
                    dominoElement.style.border = 'none';
                    definitePlacements.push([...putDominoOnBoard(placement, FOLLOWINGPLACEMENT), placement.domino]);
                }

                if (root?.reason) {
                    const subReasoningText = document.querySelector('#sub-reasoning-text');
                    subReasoningText.textContent = root.reason;
                }
                if (root?.cells) {
                    for (const cell of root.cells) {
                        highlightWrongCell(cell);
                    }
                    await waitForNextClick(nextForWrongPath, nextButton);
                    unhighlightCell(WRONG_CELL);
                    subReasoningText.textContent = '';
                }

                await dfs(root);
                removeDomino(cell1DominoHalf, cell2DominoHalf, root.value.domino);
                for (const placement of definitePlacements) {
                    removeDomino(placement[0], placement[1], placement[2]);
                }
            }
            nextForWrongPath.style.display = 'none';
            putDominoOnBoard(dominoEntry);
        }
        else {
            nextForWrongPath.style.display = 'none';
        }
    }
    nextButton.addEventListener('click', clickNext);

    const removeDomino = (cell1DominoHalf, cell2DominoHalf, domino) => {
        cell1DominoHalf.remove();
        cell2DominoHalf.remove();
        let dominoElement = dominoMap.get(JSON.stringify(domino));
        dominoElement.style.background = 'white';
        dominoElement.style.border = '1px solid black'
        createHalves(dominoElement, domino);
    }



    putDominoOnBoard = (dominoEntry, placementType = NORMAL) => {

        if (placementType !== PLACEHOLDER) {
            const dominoElement = dominoMap.get(JSON.stringify(dominoEntry.domino));
            dominoElement.style.backgroundColor = 'grey';
            dominoElement.style.border = 'none';
            dominoElement.replaceChildren();
        }


        const cell1 = indicesToCellMap.get(`${dominoEntry.cell[0]},${dominoEntry.cell[1]}`)
        const cell1DominoHalf = document.createElement('div');
        cell1DominoHalf.classList.add('domino-half');


        const otherIndices = getOtherIndex(
            dominoEntry.cell,
            dominoEntry.direction
        );

        const cell2 = indicesToCellMap.get(
            `${otherIndices[0]},${otherIndices[1]}`
        );
        const cell2DominoHalf = document.createElement('div');
        cell2DominoHalf.classList.add('domino-half');

        // const backgroudColor = placementType === INCORRECT ? 'black' : placementType === NORMAL ? 'white' : 'red';
        // const pipsColor = placementType === INCORRECT ? 'white' : placementType === NORMAL ? 'black' : 'black';
        let backgroundColor;
        let pipsColor;
        switch (placementType) {
            case INCORRECT:
                backgroundColor = 'black';
                pipsColor = 'white';
                break;
            case NORMAL:
                backgroundColor = 'white';
                pipsColor = 'black';
                break;
            case PLACEHOLDER:
                backgroundColor = 'rgba(255, 255, 255, 0.25)'; // white at 25% transparency.
                pipsColor = 'rgba(0, 0, 0, 0.25)';
                break;
            case FOLLOWINGPLACEMENT:
                backgroundColor = 'red';
                pipsColor = 'black';
                break;
        }

        // Set up both cells
        for (const cell of [cell1DominoHalf, cell2DominoHalf]) {
            cell.style.backgroundColor = backgroundColor;
            cell.style.color = pipsColor; // don't think this will do anything
            cell.style.borderTop = `2px solid ${pipsColor}`;
            cell.style.borderBottom = `2px solid ${pipsColor}`;
            cell.style.borderRight = `2px solid ${pipsColor}`;
            cell.style.borderLeft = `2px solid ${pipsColor}`;
            cell.style.borderTopLeftRadius = 'var(--border-radius)';
            cell.style.borderBottomLeftRadius = 'var(--border-radius)';
            cell.style.borderTopRightRadius = 'var(--border-radius)';
            cell.style.borderBottomRightRadius = 'var(--border-radius)';
        }

        // Add the domino values
        if (placementType === PLACEHOLDER) {
            cell1DominoHalf.append(
                '?'
            );
            cell2DominoHalf.append(
                '?'
            );
        }
        else {
            let pipHtml = pipCountToHtml;
            if (dominoEntry.direction === UP || dominoEntry.direction === DOWN)
                pipHtml = pipCountToHtmlFlipped;
            cell1DominoHalf.style.setProperty('--pip-color', pipsColor);
            cell2DominoHalf.style.setProperty('--pip-color', pipsColor);
            if (dominoEntry.domino[dominoEntry.flipped ? 1 : 0] !== 0)
                cell1DominoHalf.innerHTML = pipHtml[dominoEntry.domino[dominoEntry.flipped ? 1 : 0]]
            if (dominoEntry.domino[dominoEntry.flipped ? 0 : 1] !== 0)
                cell2DominoHalf.innerHTML = pipHtml[dominoEntry.domino[dominoEntry.flipped ? 0 : 1]]
        }


        // Remove the border between the two cells
        switch (dominoEntry.direction) {
            case UP:
                cell1DominoHalf.style.borderTop = '2px solid transparent';
                cell2DominoHalf.style.borderBottom = '2px solid transparent';
                cell1DominoHalf.style.borderTopLeftRadius = '0';
                cell1DominoHalf.style.borderTopRightRadius = '0';
                cell2DominoHalf.style.borderBottomLeftRadius = '0';
                cell2DominoHalf.style.borderBottomRightRadius = '0';
                break;

            case DOWN:
                cell1DominoHalf.style.borderBottom = '2px solid transparent';
                cell2DominoHalf.style.borderTop = '2px solid transparent';
                cell1DominoHalf.style.borderBottomLeftRadius = '0';
                cell1DominoHalf.style.borderBottomRightRadius = '0';
                cell2DominoHalf.style.borderTopLeftRadius = '0';
                cell2DominoHalf.style.borderTopRightRadius = '0';
                break;

            case RIGHT:
                cell1DominoHalf.style.borderRight = '2px solid transparent';
                cell2DominoHalf.style.borderLeft = '2px solid transparent';
                cell1DominoHalf.style.borderTopRightRadius = '0';
                cell1DominoHalf.style.borderBottomRightRadius = '0';
                cell2DominoHalf.style.borderTopLeftRadius = '0';
                cell2DominoHalf.style.borderBottomLeftRadius = '0';
                break;

            case LEFT:
                cell1DominoHalf.style.borderLeft = '2px solid transparent';
                cell2DominoHalf.style.borderRight = '2px solid transparent';
                cell1DominoHalf.style.borderTopLeftRadius = '0';
                cell1DominoHalf.style.borderBottomLeftRadius = '0';
                cell2DominoHalf.style.borderTopRightRadius = '0';
                cell2DominoHalf.style.borderBottomRightRadius = '0';
                break;
        }

        for (const child of [...cell1.children, ...cell2.children]) {
            if (!child.classList.contains('tint'))
                child.remove();
        }

        cell1.append(cell1DominoHalf);
        cell2.append(cell2DominoHalf);
        return [cell1DominoHalf, cell2DominoHalf];

    }

    getRegionMap(board);
    setColors();
    setPartCounts();
    createBoard(board);
    addDominoes(dominoes);

    // depth order:
    // board backgroudn (darker brown)

    // condition badge
    // inner cell (but not by other cells inner cells)
}
