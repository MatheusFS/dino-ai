const robot = require("robotjs");
const { performance } = require('perf_hooks');
const GAME_COLOR = '535353';

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

//import { Helper } from "./Helper";

export class Jogador {

    constructor(Leitor, Sensor) {

        this._leitor = Leitor;
        this._sensor = Sensor;
        this._deciding;

        this.status = 'INICIADO!';
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
        if (this._sensor.distancia < 80) robot.keyTap('up');
        let isActive = 0;
        let gameOverAreaCapture = this._leitor.capturePixels('GAME_OVER');
        let X = 0;
        while (X < gameOverAreaCapture.width) {
            let Y = 0;
            while (Y < gameOverAreaCapture.height) {
                if(gameOverAreaCapture.colorAt(X, Y) != GAME_COLOR) isActive = 1;
                Y++;
            }
            X++;
        }

        if(!isActive){
            this.status = 'GAME OVER!';
            this._sensor.stop();
            return this.stop();
        }
        this.status = 'ATIVO!';
        this.tempoExec = (performance.now() - t0).toFixed(1);
    }

    stop(){

        clearInterval(this._deciding);
        robot.moveMouseSmooth(this._leitor._screenSize.width*0.8, this._leitor._screenSize.height/2);
        robot.mouseClick('left');
        readline.question(`Deseja reiniciar? (0 ou 1): `, bool => {
            if(parseInt(bool)) this.start();
            readline.close()
        })
        return true;
    }
}