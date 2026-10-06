const addedDominoes = [];
import {NORMAL, INCORRECT, PLACEHOLDER} from './draw.js';
import {dominoMap, indicesToCellMap, createHalves} from './draw.js'
import {getOtherIndex, UP, DOWN, LEFT, RIGHT} from '../explainer.js'
import { pipCountToHtml, pipCountToHtmlFlipped } from '../pip-html.js';

export const putDominoOnBoard = (dominoEntry, placementType = NORMAL) => {

    // if (dominoEntry?.domino) {
        // partCountsElement.replaceChildren();
        // --currentAvailableDominoCounts[dominoEntry.domino[0]];
        // --currentAvailableDominoCounts[dominoEntry.domino[1]];
        // setPartCounts();
    // }
    let dominoElement = null;
    if (placementType !== PLACEHOLDER) {
        dominoElement = dominoMap.get(JSON.stringify(dominoEntry.domino));
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

    const ret = [cell1DominoHalf, cell2DominoHalf, dominoElement, dominoEntry.domino];
    if(dominoElement)
        addedDominoes.push(ret)
    return ret;
}

export const removeDomino = (numberToDelete) => {
    for(let i = 0; i < numberToDelete; ++i){
        const [cell1DominoHalf, cell2DominoHalf, dominoElement, domino]= addedDominoes.pop();
        cell1DominoHalf.remove();
        cell2DominoHalf.remove();
        dominoElement.style.background = 'white';
        dominoElement.style.border = '1px solid black'
        createHalves(dominoElement, domino);
    }
}

