const robot = require("robotjs");
const GAME_COLOR = '535353';
const fs = require('fs');

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
        this._gameOverArea = Helper.pointsInside([372, 89], [372 + 39, 89 + 6]);
    }

    capturePixels(area){
        switch(area){
            case 'GAME': return robot.screen.capture(this._offsetX, this._offsetY, this._width, this._height);
            case 'SENSOR': return robot.screen.capture(this._sensorArea.start[0], this._sensorArea.start[1], this._sensorArea.end[0] - this._sensorArea.start[0] + 1, this._sensorArea.end[1] - this._sensorArea.start[1] + 1);
            case 'GAME_OVER': return robot.screen.capture(this._offsetX + 372, this._offsetY + 89, 39, 6);
        }
    }

    interpretaGamePixels() {

        let pixelData = [];
        let gameCapture = this.capturePixels('GAME');

        console.log('=== INTERPRETANDO PIXELS ===');

        console.log('-> Categorizando pixels');
        let X = 0;
        while (X < this._width) {
            let Y = 0;
            while (Y < this._height) {

                pixelData.push({ X: X, Y: Y, type: (gameCapture.colorAt(X, Y) == GAME_COLOR ? 'GAME' : 'NOT') });
                Y++;
            }
            X++;
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`${(100 * X / this._width).toFixed(2)}% dos pixels lidos!`);
        }

        console.log('\n\n-> Definindo variáveis referência');
        this.defineGameVars(pixelData);

        console.log('\n\n-> Gerando imagem mapa da tela');
        Helper.captureToFile(gameCapture, {X:this._offsetX, Y:this._offsetY}, { pixelData: pixelData, dinoEyeOffset: this._dinoEyeOffset, sensorArea: this._sensorArea });
    }

    defineGameVars(pixelData) {

        let first30X = pixelData.filter(pos => pos.X < 30 && pos.type == 'GAME');
        this._floorY = this._offsetY + Helper.arrayMode(first30X.map(pos => pos.Y));
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
            X: this._offsetX + NGGGGNNNG_pattern[0].X + 1,
            Y: this._offsetY + NGGGGNNNG_pattern[0].Y + 2
        };
        process.stdout.write(`\n|___ centro do olho do dinossauro = [${this._dinoEyeOffset.X}, ${this._dinoEyeOffset.Y}]`);

        this._sensorArea = {
            start: [this._dinoEyeOffset.X + 20, this._dinoEyeOffset.Y - 80],
            end: [this._dinoEyeOffset.X + 110, this._floorY - 6]
        };
        fs.writeFileSync('test/sensorArea.json', JSON.stringify(this._sensorArea));
        process.stdout.write(`\n|___ area do sensor (ponto inicial) = [${this._sensorArea.start[0]}, ${this._sensorArea.start[1]}]`);
        process.stdout.write(`\n|___ area do sensor (ponto final) = [${this._sensorArea.end[0]}, ${this._sensorArea.end[1]}]`);
    }
}