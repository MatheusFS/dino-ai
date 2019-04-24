const Jimp = require("jimp");
const robot = require("robotjs");
const fs = require('fs');

const GAME_COLOR = '535353';

import { Helper } from "./Helper";

export class LeitorVisual {

    constructor() {

        this._screenSize = robot.getScreenSize();
        this._offsetX = 8;
        this._offsetY = 200;

        this._width = 500;
        this._height = 200;

        this._floorY = 0; // Calculated in defineGameVars()
        this._dinoEyeOffset = {}; // Calculated in defineGameVars()
        this._sensorArea = {}; // Calculated in defineGameVars()

        this._distancia = 21;
        this._altura = 0;
        this._largura = 0;
    }

    screenCaptureToFile(capture, pixelData = [], mapPainting = 0) {

        let self = this;
        new Jimp(capture.width, capture.height, function (err, img) {

            if (err) throw new Error(err);

            img.bitmap.data = capture.image;
            img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
                let red = img.bitmap.data[idx + 0];
                let blue = img.bitmap.data[idx + 2];
                img.bitmap.data[idx + 0] = blue;
                img.bitmap.data[idx + 2] = red;
            });

            if(pixelData.length){

                // Pinta pixels 'GAME' ou 'NOT'
                pixelData.forEach(pos => img.setPixelColor(Jimp.cssColorToHex(pos.type == 'GAME' ? '#FF5353' : '#53FF53'), pos.X, pos.Y));
                //pixelData.forEach(pos => img.bitmap.data[img.getPixelIndex(pos.X, pos.Y) + 0] = (pos.type == 'GAME' ? 255 : 0));

                if(mapPainting){

                    // Pinta centro do olho de azul
                    img.setPixelColor(Jimp.cssColorToHex('#5353FF'), self._dinoEyeOffset.X, self._dinoEyeOffset.Y);
    
                    // Pinta area do sensor
                    Helper.pointsInside(self._sensorArea.start, self._sensorArea.end)
                        .forEach(point => img.bitmap.data[img.getPixelIndex(point.X, point.Y) + 1] = 0);
                }
            }

            //Salva imagem
            img.write("test/" + (new Date().getTime()) + '.jpg');
            console.log('Imagem criada com sucesso!')
        })
    }

    scanScreen() {

        let pixelData = [];
        let screen = robot.screen.capture(this._offsetX, this._offsetY, this._width, this._height);
        let step = 1;

        console.log('-> Categorizando pixels');
        let X = 0;
        while (X < this._width) {
            let Y = 0;
            while (Y < this._height) {

                pixelData.push({ X: X, Y: Y, type: (screen.colorAt(X, Y) == GAME_COLOR ? 'GAME' : 'NOT') });
                Y += step;
            }
            X += step;
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`${(100 * X / this._width).toFixed(2)}% dos pixels lidos!`);
        }

        console.log('\n\n-> Interpretando os pixels');
        let data = JSON.stringify(pixelData, null, 2);
        fs.writeFileSync('test/pixelData.json', data);
        process.stdout.write('|___ pixelData.json salvo!');
        this.defineGameVars(pixelData);

        console.log('\n\n-> Gerando imagem mapa da tela');
        this.screenCaptureToFile(screen, pixelData, 1);
    }

    defineGameVars(pixelData) {

        let first20X = pixelData.filter(pos => pos.X < 20 && pos.type == 'GAME');
        this._floorY = Helper.array_mode(first20X.map(pos => pos.Y));
        process.stdout.write(`\n|___ posição Y do chão = ${this._floorY}`);

        let NGGGGNNNG_pattern = pixelData.filter((pos, idx, arr) => {

            return pos.type == 'GAME'
                && arr[idx - 4].type == 'NOT'
                && arr[idx - 3].type == 'GAME'
                && arr[idx - 2].type == 'GAME'
                && arr[idx - 1].type == 'GAME'
                && arr[idx + 1].type == 'NOT'
                && arr[idx + 2].type == 'NOT'
                && arr[idx + 3].type == 'NOT'
                && arr[idx + 4].type == 'GAME';
        });

        this._dinoEyeOffset = {
            X: NGGGGNNNG_pattern[0].X + 1,
            Y: NGGGGNNNG_pattern[0].Y + 2
        };
        process.stdout.write(`\n|___ centro do olho do dinossauro = [${this._dinoEyeOffset.X}, ${this._dinoEyeOffset.Y}]`);

        this._sensorArea = {
            start: [this._dinoEyeOffset.X + 20, this._dinoEyeOffset.Y - 80],
            end: [this._dinoEyeOffset.X + 110, this._dinoEyeOffset.Y + 50]
        };
        process.stdout.write(`\n|___ area do sensor (ponto inicial) = [${this._sensorArea.start[0]}, ${this._sensorArea.start[1]}]`);
        process.stdout.write(`\n|___ area do sensor (ponto final) = [${this._sensorArea.end[0]}, ${this._sensorArea.end[1]}]`);
    }

    sensores(interval) {

        let sensorReading = setInterval(()=>{
            let sensorMatrix = {};
            let sensorCapture = robot.screen.capture(this._sensorArea.start[0]+this._offsetX, this._sensorArea.start[1]+this._offsetY,91,131);
            let sensorPoints = Helper.pointsInside(this._sensorArea.start, this._sensorArea.end);
            let sensorXPoints = Helper.pluck('X', sensorPoints);
            sensorXPoints.forEach(pointX => {

                let arrayY_forX = Helper.pluck('Y',sensorPoints.filter(point => point.X == pointX && point.Y < this._floorY - 5));
                let arrayY = arrayY_forX
                    .filter(Y => sensorCapture.colorAt(pointX-this._sensorArea.start[0], Y-this._sensorArea.start[1]) == GAME_COLOR);
                if(arrayY.length)
                    sensorMatrix[pointX] = arrayY;
            });
            let pixelData = [];
            let obstaculoMinX = 200;
            let obstaculoMaxX = 0;
            let obstaculoMinY = 200;
            let obstaculoMaxY = 0;
            for(let X in sensorMatrix){
                
                if(obstaculoMinX > X) obstaculoMinX = X;
                if(obstaculoMaxX < X) obstaculoMaxX = X;

                sensorMatrix[X]
                    .forEach(Y => {
                        pixelData.push({X: parseInt(X)-this._sensorArea.start[0], Y: Y-this._sensorArea.start[1], type: 'GAME'})
                        if(obstaculoMinY > Y) obstaculoMinY = Y;
                        if(obstaculoMaxY < Y) obstaculoMaxY = Y;
                    })
            }

            this._distancia = obstaculoMinX-this._dinoEyeOffset.X;
            this._altura = obstaculoMaxY-obstaculoMinY;
            this._largura = obstaculoMaxX-obstaculoMinX;

            if(this._distancia <= 20){
                clearInterval(sensorReading);
                console.clear();
            }

            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`DISTÂNCIA: ${this._distancia} | ALTURA: ${this._altura} | LARGURA: ${this._largura}`);
            //this.screenCaptureToFile(sensorCapture, pixelData);
            //fs.writeFileSync('test/sensorMatrix.json', JSON.stringify(sensorMatrix));
        }, interval);
    }
}