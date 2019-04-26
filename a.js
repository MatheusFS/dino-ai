var robot = require('robotjs');
const Jimp = require("jimp");

let capture = robot.screen.capture(372+8, 89+200, 39, 6); // 372, 89, 39, 6

let image = new Jimp(capture.width, capture.height);
image.bitmap.data = capture.image;
image.writeAsync("test/" + (new Date().getTime()) + '.jpg')
    .then(res => {
        console.log(res);
        process.exit(0);
    })
    .catch(rej => {
        throw new Error(rej);
    });