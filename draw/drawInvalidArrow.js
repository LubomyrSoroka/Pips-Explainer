import { getOtherIndex } from "../explainer.js";
import { indicesToCellMap } from "./draw.js";
import { DOWN, UP, RIGHT, LEFT } from "../explainer.js"

export const drawArrow = (cell, directions = null) => {
    const cellElement = indicesToCellMap.get(typeof cell === 'string' ? cell : `${cell[0]},${cell[1]}`);
    // const lastBorder = cellElement.style.border;
    // the arrow is facing right.


    for(const direction of directions){
        const arrowsvg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg'
        );
        arrowsvg.innerHTML = `
            <!-- Arrow -->
            <path d="M8 32 H52 M38 18 L52 32 L38 46"
                    stroke="currentColor"
                    stroke-width="4"
                    stroke-linecap="round"
                    stroke-linejoin="round"/>
            <!-- Cross -->
            <path d="M22 10 L42 54"
                    stroke="red"
                    stroke-width="4"
                    stroke-linecap="round"/>
            </svg>
        `;

        arrowsvg.style.height = '16px';
        arrowsvg.style.width = '16px';
        arrowsvg.style.position = 'absolute';
        arrowsvg.style.zIndex = '10';
        arrowsvg.transformOrigin = 'center';
        switch (direction) {

            case DOWN:
                arrowsvg.style.left = '50%';
                arrowsvg.style.bottom = 0;
                arrowsvg.style.transform = "rotate (90deg) translateX(-50%)";
                break;

            case UP:
                arrowsvg.style.left = '50%';
                arrowsvg.style.top = 0;
                arrowsvg.style.transform= "rotate(-90deg) translateX(-50%)";
                break;

            case RIGHT:
                arrowsvg.style.top = '50%'; 
                arrowsvg.style.right = 0;
                arrowsvg.style.transform= "translateY(-50%)";
                break;
            case LEFT:
                arrowsvg.style.top = '50%';
                arrowsvg.style.left = 0;
                arrowsvg.style.transform= "rotate(180deg) translateY(-50%)";
                break;
        }

        cellElement.style.position = 'relative';

        cellElement.appendChild(arrowsvg);
    }
}

// export const drawArrow = (cell, directions = null) => {
//     const cellElement = indicesToCellMap.get(
//         typeof cell === 'string' ? cell : `${cell[0]},${cell[1]}`
//     );

//     if (!cellElement || !direction) return;

//     const arrowsvg = document.createElementNS(
//         'http://www.w3.org/2000/svg',
//         'svg'
//     );

//     arrowsvg.setAttribute('width', '64');
//     arrowsvg.setAttribute('height', '64');
//     arrowsvg.setAttribute('viewBox', '0 0 64 64');

//     arrowsvg.innerHTML = `
//         <!-- Arrow -->
//         <path d="M8 32 H52 M38 18 L52 32 L38 46"
//             stroke="currentColor"
//             stroke-width="4"
//             stroke-linecap="round"
//             stroke-linejoin="round"/>

//         <!-- Cross -->
//         <path d="M22 10 L42 54"
//             stroke="red"
//             stroke-width="4"
//             stroke-linecap="round"/>
//     `;

//     const rotations = {
//         [RIGHT]: 0,
//         [DOWN]: 90,
//         [LEFT]: 180,
//         [UP]: -90
//     };

//     if (!(direction in rotations)) return;

//     Object.assign(arrowsvg.style, {
//         position: 'absolute',
//         width: '64px',
//         height: '64px',
//         left: '50%',
//         top: '50%',
//         transform: `translate(-50%, -50%) rotate(${rotations[direction]}deg)`,
//         pointerEvents: 'none',
//         zIndex: '10'
//     });

//     // Make sure the cell is a positioning context.
//     if (getComputedStyle(cellElement).position === 'static') {
//         cellElement.style.position = 'relative';
//     }

//     cellElement.appendChild(arrowsvg);
// };