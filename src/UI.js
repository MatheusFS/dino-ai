const blessed = require('blessed');
const contrib = require('blessed-contrib');
const Jimp = require("jimp");

export class UIRenderer {

    constructor(Leitor, Sensor, Jogador) {

        // Resources
        this._leitor = Leitor;
        this._sensor = Sensor;
        this._jogador = Jogador;

        // Model
        this._screen = blessed.screen({ smartCSR: true });
        this._screen.title = 'Teste UI';
        this._grid = new contrib.grid({ rows: 13, cols: 13, screen: this._screen });
        this._blockSensores = this._grid.set(0, 0, 4, 8, contrib.bar, { label: 'SENSORES', barWidth: 6, barSpacing: 15, xOffset: 5, maxHeight: 90 });
        this._blockJogador = this._grid.set(0, 8, 4, 4, contrib.log, { fg: 'green', selectedFg: 'blue', label: 'JOGADOR' });
        this._blockPerformance = this._grid.set(4, 0, 4, 8, contrib.line, { style: { line: "yellow", text: "green", baseline: "black" }, xLabelPadding: 3, xPadding: 5, showLegend: true, wholeNumbersOnly: false, label: 'Performance dos Módulos' });
        this._blockVisao = this._grid.set(4, 8, 4, 4, blessed.box, { style: { bg: 'magenta' } });
        this._screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0));

        this._sensorPerfY = [];
        this._jogadorPerfY = [];

        this._atualizando;
    }

    render(interval) {

        //console.clear();
        this._atualizando = setInterval(this.atualiza.bind(this), interval);
    }

    atualiza() {

        let sensor = this._sensor;
        let jogador = this._jogador;
        let leitor = this._leitor;

        if (this._sensorPerfY.length == 8) this._sensorPerfY.shift();
        this._sensorPerfY.push(parseFloat(sensor.tempoExec));

        if (this._jogadorPerfY.length == 8) this._jogadorPerfY.shift();
        this._jogadorPerfY.push(parseFloat(jogador.tempoExec));

        let sensorPerfY = this._sensorPerfY;
        let jogadorPerfY = this._jogadorPerfY;
        let x = Array.from(new Array(8), (v, i) => `t${i}`);

        // Atualiza data
        this._blockSensores.setData({
            titles: ['Distância', 'Altura', 'Largura'],
            data: [sensor.distancia, sensor.altura, sensor.largura]
        });
        this._blockJogador.log(`${jogador.status}`);
        this._blockPerformance.setData([
            { title: 'Sensores', x: x, y: sensorPerfY, style: { line: 'yellow' } },
            { title: 'Jogador', x: x, y: jogadorPerfY, style: { line: 'green' } }
        ]);

        // let image = leitor.capturePixels('GAME_OVER');
        // let jimg = new Jimp(image.width, image.height);
        // jimg.bitmap.data = image.image;
        // let buffer;
        // jimg.getBuffer(Jimp.MIME_PNG, (err, result) => buffer = result);

        // let img = blessed.image({
        //     parent: this._screen,
        //     top: 0,
        //     left: 0,
        //     width: 40,
        //     file: buffer //__dirname+'\\..\\test\\aaa.png'
        // });

        // Renderiza atualizações
        this._screen.render();
    }
}