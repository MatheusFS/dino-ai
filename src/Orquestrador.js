import { LeitorVisual } from "./LeitorVisual";
import { Sensores } from "./Sensores";
import { Jogador } from "./Jogador";
import { UIRenderer } from "./UI";

export class Orquestrador{

    constructor(){

        throw new Error('A classe Orquestrador não pode ser instânciada');
    }

    static init(){

        let config = {interval: 100};
        process.env.TERM = 'windows-ansi';

        let Leitor = new LeitorVisual();
        Leitor.interpretaGamePixels();

        let Sensor = new Sensores(Leitor);
        Sensor.start(config.interval);
        
        let Jogador1 = new Jogador(Leitor, Sensor);
        Jogador1.start(config.interval);

        let UI = new UIRenderer(Leitor, Sensor, Jogador1);
        UI.render(config.interval);
    }
}