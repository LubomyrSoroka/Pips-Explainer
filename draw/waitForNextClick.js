// import { clickNext } from './clickNext.js';

// export let shouldExit = false;
// export const waitForNextClick = (button, nextForWrongPathButton = null) => {
//     return new Promise(resolve => {
//         button.addEventListener('click',
//             () => {
//                 shouldExit = false;
//                 resolve();
//             }
//             , { once: true });
//         if (nextForWrongPathButton) {
//             nextForWrongPathButton.addEventListener('click',
//                 () => {
//                     shouldExit = true;
//                     //unhighlightCell(CURRENT_CELL);
//                     //unhighlightCell(WRONG_CELL);
//                     resolve();
//                 }
//                 , { once: true });
//         }
//     });
// };

import { FORWARD, BACKWARD, nextButton, nextForWrongPath, backButton } from "./draw.js";


export let lastDirection;

export const waitForNextClick = () => {
    return new Promise(resolve => {
        nextForWrongPath.addEventListener('click',
            () => {
                resolve(false);
            }
            , { once: true });
        nextButton.addEventListener('click',
            () => {
                lastDirection = FORWARD;
                resolve(true);
            }
            , { once: true });
        backButton.addEventListener('click',
            () => {
                lastDirection = BACKWARD;
                resolve(true);
            }
            , { once: true });

    });
};