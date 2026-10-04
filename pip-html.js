const onePip = `
    <div class='circle' style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)'></div>
`

const twoPips = `
    <div class='circle' style='position: absolute; left: 25%; top: 25%;'></div>
    <div class='circle' style='position: absolute; right: 25%; bottom: 25%;'></div>
`
const twoPipsFlipped = `
    <div class='circle' style='position: absolute; left: 25%; bottom: 25%;'></div>
    <div class='circle' style='position: absolute; right: 25%; top: 25%;'></div>
`

const threePips = `
    <div class='circle' style='position: absolute; left: 25%; top: 25%;'></div>
    <div class='circle' style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)'></div>
    <div class='circle' style='position: absolute; right: 25%; bottom: 25%;'></div>
`

const threePipsFlipped = `
    <div class='circle' style='position: absolute; left: 25%; bottom: 25%;'></div>
    <div class='circle' style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)'></div>
    <div class='circle' style='position: absolute; right: 25%; top: 25%;'></div>
`

const fourPips = `
    <div class='circle' style='position: absolute; left: 25%; top: 25%;'></div>
    <div class='circle' style='position: absolute; left: 25%; bottom: 25%;'></div>
    <div class='circle' style='position: absolute; right: 25%; top: 25%;'></div>
    <div class='circle' style='position: absolute; right: 25%; bottom: 25%;'></div>
`

const fivePips = `
    <div class='circle' style='position: absolute; left: 25%; top: 25%;'></div>
    <div class='circle' style='position: absolute; left: 25%; bottom: 25%;'></div>
    <div class='circle' style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)'></div>
    <div class='circle' style='position: absolute; right: 25%; top: 25%;'></div>
    <div class='circle' style='position: absolute; right: 25%; bottom: 25%;'></div>
`

const sixPips = `
    <div class='circle' style='position: absolute; left: 25%; top: 25%;'></div>
    <div class='circle' style='position: absolute; left: 25%; bottom: 25%;'></div>
    <div class='circle' style='position: absolute; left: 50%; top: 25%; transform: translateX(-50%)'></div>
    <div class='circle' style='position: absolute; left: 50%; bottom: 25%; transform: translateX(-50%)'></div>
    <div class='circle' style='position: absolute; right: 25%; top: 25%;'></div>
    <div class='circle' style='position: absolute; right: 25%; bottom: 25%;'></div>
`

const sixPipsFlipped = `
    <div class='circle' style='position: absolute; left: 25%; top: 25%;'></div>
    <div class='circle' style='position: absolute; left: 25%; bottom: 25%;'></div>
    <div class='circle' style='position: absolute; left: 25%; top: 50%; transform: translateY(-50%)'></div>
    <div class='circle' style='position: absolute; right: 25%; top: 50%; transform: translateY(-50%)'></div>
    <div class='circle' style='position: absolute; right: 25%; top: 25%;'></div>
    <div class='circle' style='position: absolute; right: 25%; bottom: 25%;'></div>
`

export const pipCountToHtml = {
    1: onePip,
    2: twoPips,
    3: threePips,
    4: fourPips,
    5: fivePips,
    6: sixPips
};

export const pipCountToHtmlFlipped = {
    1: onePip,
    2: twoPipsFlipped,
    3: threePipsFlipped,
    4: fourPips,
    5: fivePips,
    6: sixPipsFlipped
}