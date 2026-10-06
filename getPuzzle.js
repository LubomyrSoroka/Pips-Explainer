import { solve } from './explainer.js'
import { draw } from './draw/draw.js'


const getPuzzle = async () => {
    await solve();
    draw();
}

document.querySelector('#get-puzzle').addEventListener('click', getPuzzle);

const input = document.querySelector("input[type='date']");
const date = new Date();
const localDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
input.value = localDate;