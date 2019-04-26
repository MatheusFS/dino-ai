const fs = require('fs');
const { performance } = require('perf_hooks');
const GAME_COLOR = '535353';

import { Helper } from "./Helper";

export class Sensores{

    constructor(Leitor){

        this._leitor = Leitor;

        this._pixelData = [];
        this._area = this._leitor._sensorArea;
        this._matrix = {};
        this._points = Helper.pointsInside(this._area.start.map(c => c - c), this._area.end.map((c,i) => c - this._area.start[i]));
        this._XPoints = Helper.pluck('X', this._points);
        
        this._capture;
        this._reading;

        this._obstaculoMinX;
        this._obstaculoMaxX;
        this._obstaculoMinY;
        this._obstaculoMaxY;
        this._obstaculoArea;

        this.distancia = 0;
        this.altura = 0;
        this.largura = 0;
        this.tempoExec = 0;
    }

    start(interval) {

        
        this._XPoints.forEach(X => {
            this._matrix[X] = Helper.pluck('Y', this._points.filter(p => p.X == X))
        });
        this._reading = setInterval(this.read.bind(this), interval);
    }

    read(){

        let t0 = performance.now();
        this._capture = this._leitor.capturePixels('SENSOR');
        this._pixelData = [];
        this._obstaculoMinX = 90;
        this._obstaculoMaxX = 0;
        this._obstaculoMinY = 116;
        this._obstaculoMaxY = 0;

        for (let X in this._matrix) {
            
            let gameColorYs = this._matrix[X].filter(Y => this._capture.colorAt(X, Y) == GAME_COLOR);
            
            if(gameColorYs.length){
                this._matrix[X] = gameColorYs;
                if (this._obstaculoMinX > X) this._obstaculoMinX = parseInt(X);
                if (this._obstaculoMaxX < X) this._obstaculoMaxX = parseInt(X);

                this._matrix[X].forEach(Y => {
                    this._pixelData.push({ X: parseInt(X), Y: Y, type: 'GAME' });
                    if (this._obstaculoMinY > Y) this._obstaculoMinY = Y;
                    if (this._obstaculoMaxY < Y) this._obstaculoMaxY = Y;
                })
            }
        }
        
        this._obstaculoArea = {
            start: [this._obstaculoMinX, this._obstaculoMinY],
            end: [this._obstaculoMaxX, this._obstaculoMaxY]
        };

        this.distancia = this._obstaculoMinX;
        this.altura = this._obstaculoMaxY - this._obstaculoMinY;
        this.largura = this._obstaculoMaxX - this._obstaculoMinX;
        let t1 = performance.now();
        this.tempoExec = (t1 - t0).toFixed(1);
        //fs.writeFileSync('test/_obstaculoArea.json', JSON.stringify(this._obstaculoArea));
        // if(this.distancia < 50){
        //     fs.writeFileSync('test/sensores/matrix.json', JSON.stringify(this._matrix));
        //     fs.writeFileSync('test/sensores/pixelData.json', JSON.stringify(this._pixelData));
        //     Helper.captureToFile({bmp: this._capture, offset:{X:0,Y:0}}, { pixelData: this._pixelData, sensorArea: this._obstaculoArea})
        //     .catch(() => process.exit(1));
        // }
    }

    stop(){

        clearInterval(this._reading);
        console.log('Sensores parado!');
    }
}