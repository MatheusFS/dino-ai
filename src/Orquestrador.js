import { LeitorVisual } from "./LeitorVisual";
import { Sensores } from "./Sensores";
import { Jogador } from "./Jogador";
import { UIRenderer } from "./UI";
import { RedeNeural } from "./RedeNeural";

const robot = require("robotjs");
// const readline = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

export class Orquestrador {

    constructor() {

        this._config = { interval: 20 };
        this._leitor = new LeitorVisual();
        this._leitor.interpretaGamePixels();
        this._sensores = new Sensores(this._leitor);
        this._sensores.start(this._config.interval);
        this._jogador = new Jogador(this._leitor, this._sensores);
        this._jogador.start(this._config.interval);
        this._UI = new UIRenderer(this._leitor, this._sensores, this._jogador);
        this._UI.render(this._config.interval);
        this.redeNeural = new RedeNeural();
    }

    end() {
        robot.moveMouse(this._leitor._screenSize.width * 0.75, this._leitor._screenSize.height / 4);
        robot.mouseClick('left');
        process.exit(0);
    }
}