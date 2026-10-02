import { solve } from './explainer.js'
import { draw } from './script.js'


const getPuzzle = async () => {
    await solve();
    draw();
}

document.querySelector('#get-puzzle').addEventListener('click', getPuzzle);