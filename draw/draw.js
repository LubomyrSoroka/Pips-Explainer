import { board } from "../explainer.js"
import { dominoes } from "../explainer.js"
import { initialDominoPartCounts } from "../explainer.js";
import { pipCountToHtml } from "../pip-html.js";
import { getBoardSumRange, getUnknownsExpression } from "../sum.js";
import { clickNext } from "./clickNext.js";


export const NORMAL = 'normal';
export const INCORRECT = 'incorrect';
export const FOLLOWINGPLACEMENT = 'following placement';
export const PLACEHOLDER = 'placeholder';

const partCountsElement = document.querySelector('#part-counts');
const sumsElements = document.querySelector('#sums')
export const controls = document.querySelector("#controls");

export const nextButton = document.createElement('button');
export const backButton = document.createElement('button');
backButton.id = 'back-button';
backButton.textContent = 'Back';

nextButton.id = "next-button";
nextButton.textContent = "Next";

export const nextForWrongPath = document.createElement('button');
nextForWrongPath.id = "next-button-for-wrong-path";
nextForWrongPath.textContent = "Next (wrong path)";
nextForWrongPath.style.display = 'none';

export const indicesToCellMap = new Map();
let currentAvailableDominoCounts = { ...initialDominoPartCounts };


const setPartCounts = () => {
    for (let i = 0; i < 6; ++i) {
        const partCountElement = document.createElement('div');
        partCountElement.textContent = `${i}: ${currentAvailableDominoCounts[i]} out of ${initialDominoPartCounts[i]}`;
        partCountsElement.appendChild(partCountElement);
    }
}


const setDominoSum = () => {
    const dominoSumsElement = document.createElement('div');

    const pipsSum = Object.entries(initialDominoPartCounts).reduce((acc, curr) => acc + curr[0] * curr[1], 0);
    dominoSumsElement.textContent = `Sum of all pips on all dominoes: ${pipsSum}`;
    sumsElements.appendChild(dominoSumsElement);

    const { minSum, maxSum } = getBoardSumRange();
    const boardSumRangeElement = document.createElement('div');
    boardSumRangeElement.innerHTML = `Board sum range: ${minSum} + ${getUnknownsExpression()} &le; ${pipsSum} &le; ${maxSum} + ${getUnknownsExpression()}`;
    sumsElements.appendChild(boardSumRangeElement);
}

let possibleCells = new Set();

// the indices that correspond to the cell that should have the badge for a region
// this goes to the cell which is lowest in the region. For cells which are equally low, take the right-most cell.
let badgeIndices = new Map();

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


let indicesToRegion = new Map();

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

let regionToColor = new Map();
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
            return '&ne;';
        default:
            return '';
    }
}

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



export const dominoMap = new Map();

const addDominoes = (dominoes) => {
    const dominoesElement = document.querySelector('#dominoes');
    for (const domino of dominoes) {

        const dominoElement = document.createElement('div');
        // what if there are two dominoes which are identicial (rare)
        createHalves(dominoElement, domino);
        dominoesElement.appendChild(dominoElement);
    }
}

export const createHalves = (dominoElement, domino) => {
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


export const FORWARD = 1;
export const BACKWARD = -1;

export const clickForward = () => {clickNext(FORWARD)};
export const clickBackward = () => {clickNext(BACKWARD)};

nextButton.addEventListener('click', clickForward);



document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        nextButton.click();
    }
})

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        backButton.click();
    }
})

import { lastSinglePlacementCells, allSinglePlacementCells } from "./drawStructure.js";

export const draw = () => {

    const reasoningText = document.querySelector('#reasoning-text');
    if (reasoningText)
        reasoningText.textContent = '';

    const subReasoningText = document.querySelector('#sub-reasoning-text');
    if (subReasoningText)
        subReasoningText.textContent = '';


    controls.replaceChildren();

    controls.appendChild(nextButton);
    controls.appendChild(nextForWrongPath);
    controls.appendChild(backButton);
    backButton.style.display = 'none';

    const boardElement = document.querySelector('#board');
    boardElement.replaceChildren();
    const dominoesElement = document.querySelector('#dominoes');
    dominoesElement.replaceChildren();

    partCountsElement.replaceChildren();

    sumsElements.replaceChildren();

    const boardCopy = structuredClone(board);
    indicesToRegion = new Map();
    regionToColor = new Map();
    possibleCells.clear();
    badgeIndices = new Map();
    lastSinglePlacementCells.clear();
    allSinglePlacementCells.clear();

    getRegionMap(boardCopy);
    setColors();
    setPartCounts();
    setDominoSum();
    createBoard(boardCopy);
    addDominoes(dominoes);

    // depth order:
    // board backgroudn (darker brown)

    // condition badge
    // inner cell (but not by other cells inner cells)
}
