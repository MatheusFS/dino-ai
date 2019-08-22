const robot = require("robotjs");
const { performance } = require('perf_hooks');
const GAME_COLOR = '535353';

//import { Helper } from "./Helper";

export class Jogador {

    constructor(Leitor, Sensor) {

        this._leitor = Leitor;
        this._sensor = Sensor;
        this._deciding;

        this.status = 'INICIADO!';
        this.isActive = 1;
        this.tempoExec = 0;
    }

    start(interval) {

        console.log('\nJogador iniciado!\n');
        robot.moveMouseSmooth(this._leitor._dinoEyeOffset.X, this._leitor._dinoEyeOffset.Y);
        robot.mouseClick('left');
        robot.keyTap('up');
        this._deciding = setInterval(this.decide.bind(this), interval);
    }

    decide() {
        let t0 = performance.now();
        if (this._sensor.distancia < 85) robot.keyTap('up');
        this.isActive = 0;
        let gameOverAreaCapture = this._leitor.capturePixels('GAME_OVER');
        let X = 0;
        while (X < gameOverAreaCapture.width) {
            let Y = 0;
            while (Y < gameOverAreaCapture.height) {
                if(gameOverAreaCapture.colorAt(X, Y) != GAME_COLOR) this.isActive = 1;
                Y++;
            }
            X++;
        }

        if(!this.isActive){
            this.status = 'GAME OVER!';
            this._sensor.stop();
            this.stop();
            return;
        }
        this.status = 'ATIVO!';
        this.tempoExec = (performance.now() - t0).toFixed(1);
    }

    stop(){
        clearInterval(this._deciding);
        this._deciding = false;
    }
}