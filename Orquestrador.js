class Orquestrador{

    constructor(){

        throw new Error('A classe Orquestrador não pode ser instânciada');
    }

    static init(){

        console.log('Iniciado!');
    }
}

module.exports = Orquestrador;