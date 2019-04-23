import { LeitorVisual } from "./LeitorVisual";

export class Orquestrador{

    constructor(){

        throw new Error('A classe Orquestrador não pode ser instânciada');
    }

    static init(){

        let Leitor = new LeitorVisual();
        Leitor.screenCaptureToFile()
            .then(res => console.log(res))
            .catch(err => console.log(err))
    }
}