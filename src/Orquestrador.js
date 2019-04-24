import { LeitorVisual } from "./LeitorVisual";
import { Jogador } from "./Jogador";

export class Orquestrador{

    constructor(){

        throw new Error('A classe Orquestrador não pode ser instânciada');
    }

    static init(){

        let Leitor = new LeitorVisual();
        let Jogador1 = new Jogador(Leitor);

        Leitor.scanScreen();
        Leitor.sensores(200);
        Jogador1.start();
    }
}