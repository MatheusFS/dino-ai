const Jimp = require("jimp");

export class Helper {

    constructor() {

        throw new Error('Não pode instânciar o Helper');
    }

    static arrayMode(arr) {
        var mode = {};
        var max = 0, count = 0;

        arr.forEach(function (e) {
            if (mode[e]) { mode[e]++; }
            else { mode[e] = 1; }

            if (count < mode[e]) {
                max = e;
                count = mode[e];
            }
        });

        return max;
    }

    static pointsInside(start, end) {

        let points = [];

        for (let i = start[0]; i <= end[0]; i++) {
            for (let j = start[1]; j <= end[1]; j++) {
                points.push({ X: i, Y: j });
            }
        }
        return points;
    }

    static getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    static pluck(prop, array){

        let result = [];
        array.forEach(element => {
            if(!result.includes(element[prop])) result.push(element[prop])
        });
        return result;
    }

    static captureToFile(capture, offset = {X:0, Y:0}, mapPainting = {}) {

        // let image = new Jimp(capture.width, capture.height, function (err, img) {

        //     if (err) throw new Error(err);

        //     img.bitmap.data = capture.image;
        //     img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
        //         let red = img.bitmap.data[idx + 0];
        //         let blue = img.bitmap.data[idx + 2];
        //         img.bitmap.data[idx + 0] = blue;
        //         img.bitmap.data[idx + 2] = red;
        //     });

        // });

        let image = new Jimp(capture.width, capture.height);
        image.bitmap.data = capture.image;

        if(mapPainting.pixelData){

            // Pinta pixels 'GAME' ou 'NOT'
            mapPainting.pixelData.forEach(pos => image.setPixelColor(Jimp.cssColorToHex(pos.type == 'GAME' ? '#FF5353' : '#53FF53'), pos.X, pos.Y));
            //pixelData.forEach(pos => img.bitmap.data[img.getPixelIndex(pos.X, pos.Y) + 0] = (pos.type == 'GAME' ? 255 : 0));
        }

        if(mapPainting.dinoEyeOffset){

            // Pinta centro do olho de azul
            image.setPixelColor(Jimp.cssColorToHex('#5353FF'), mapPainting.dinoEyeOffset.X - offset.X, mapPainting.dinoEyeOffset.Y - offset.Y);
        }

        if(mapPainting.sensorArea){

            // Pinta area do sensor
            Helper.pointsInside(mapPainting.sensorArea.start, mapPainting.sensorArea.end)
                .forEach(point => image.bitmap.data[image.getPixelIndex(point.X - offset.X, point.Y - offset.Y) + 1] = 0);
        }

        //Salva imagem
        return image.writeAsync("test/" + (new Date().getTime()) + '.jpg');
    }
}