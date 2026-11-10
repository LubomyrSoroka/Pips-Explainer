import { clickNext } from './clickNext.js';

export let shouldExit = false;
export const waitForNextClick = (button, nextForWrongPathButton = null) => {
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
                    //unhighlightCell(WRONG_CELL);
                    resolve();
                }
                , { once: true });
        }
    });
};

// import { nextButton, nextForWrongPath, backButton } from "./draw.js";


// export let shouldExit = false;

// export const waitForNextClick = (button, nextForWrongPathButton = null) => {
//     return new Promise(resolve => {
//         nextButton.addEventListener('click',
//             () => {
//                 shouldExit = false;
//                 resolve();
//             }
//             , { once: true });
//         nextForWrongPath.addEventListener('click',
//             () => {
//                 shouldExit = true;
//                 resolve();
//             }
//             , { once: true });
//         backButton.addEventListener('click',
//             () => {
//                 shouldExit = true;
//                 resolve();
//             }
//             , { once: true });

//     });
// };