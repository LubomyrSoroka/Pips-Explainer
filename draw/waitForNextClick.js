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