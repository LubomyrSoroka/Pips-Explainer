import { getOtherIndex } from "../explainer.js";
import { indicesToCellMap } from "./draw.js";
import { DOWN, UP, RIGHT, LEFT } from "../explainer.js"

export const drawArrow = (cell, direction = null) => {
    const cellElement = indicesToCellMap.get(typeof cell === 'string' ? cell : `${cell[0]},${cell[1]}`);
    //const lastBorder = cellElement.style.border;
    // the arrow is facing right.

    const arrowsvg = document.createElement('svg');
    cellElement.getBoundingClientRect();
    for(const direction of directions){
        switch (direction) {
            case DOWN:
                arrowsvg.transform.rotate = "90deg";
                arrowsvg.style.left = cellElement.left + cellElement.width/2; // subtract arrowsvg width
                arrowsvg.style.bottom = cellElement.bottom;
                break;
            case UP:
                arrowsvg.transform.rotate = "-90deg";
                arrowsvg.style.left = cellElement.left + cellElement.width/2; // subtract arrowsvg width
                arrowsvg.style.top = cellElement.top;
                break;
            case RIGHT:
                break;
            case LEFT:
                break;
        }
    }
}
