const robot = require("robotjs");

export class Jogador{

    constructor(Leitor){

        this._leitor = Leitor;
    }

    start(){

        console.log('\nJogador iniciado!\n');
        robot.moveMouseSmooth(this._leitor._dinoEyeOffset.X + this._leitor._offsetX, this._leitor._dinoEyeOffset.Y + this._leitor._offsetY);
        robot.mouseClick('left')
    }
}