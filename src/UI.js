import { orquestrador } from './start';

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const { performance } = require('perf_hooks');
//const Jimp = require("jimp");

export class UIRenderer {

    constructor(Leitor, Sensor, Jogador) {

        // Resources
        this._leitor = Leitor;
        this._sensor = Sensor;
        this._jogador = Jogador;

        // Model
        this._screen = blessed.screen({ smartCSR: true });
        this._screen.title = 'Teste UI';
        this._grid = new contrib.grid({ rows: 14, cols: 14, screen: this._screen });
        this._blockSensores = this._grid.set(0, 0, 4, 8, contrib.bar, { label: 'SENSORES', barWidth: 6, barSpacing: 15, xOffset: 5, maxHeight: 90 });
        this._blockJogador = this._grid.set(0, 8, 4, 4, contrib.log, { fg: 'green', selectedFg: 'blue', label: 'JOGADOR' });
        this._blockPerformance = this._grid.set(4, 0, 4, 8, contrib.line, { style: { line: "yellow", text: "green", baseline: "black" }, xLabelPadding: 3, xPadding: 5, showLegend: true, wholeNumbersOnly: false, label: 'Performance dos Módulos' });
        this._blockVisao = this._grid.set(4, 8, 4, 4, blessed.box, { style: { bg: 'magenta' } });
        this._screen.key(['escape', 'q', 'C-c'], (ch, key) => process.exit(0));

        this._sensorPerf = [];
        this._jogadorPerf = [];
        this._UIPerf = [];

        this._atualizando;
        this.tempoExec = 0;
    }

    render(interval) {

        //console.clear();
        this._atualizando = setInterval(this.atualiza.bind(this), interval);
    }

    atualiza() {
        let t0 = performance.now();
        let sensor = this._sensor;
        let jogador = this._jogador;
        let leitor = this._leitor;

        if(!sensor._reading || !jogador._deciding){
            this._screen.destroy();
            orquestrador.end();
        }

        if (this._sensorPerf.length == 8) this._sensorPerf.shift();
        this._sensorPerf.push(parseFloat(sensor.tempoExec));

        if (this._jogadorPerf.length == 8) this._jogadorPerf.shift();
        this._jogadorPerf.push(parseFloat(jogador.tempoExec));

        if (this._UIPerf.length == 8) this._UIPerf.shift();
        this._UIPerf.push(parseFloat(this.tempoExec));

        let x = Array.from(new Array(8), (v, i) => `t${i}`);

        // Atualiza data
        this._blockSensores.setData({
            titles: ['Distância', 'Altura', 'Largura'],
            data: [sensor.distancia, sensor.altura, sensor.largura]
        });
        this._blockJogador.log(`${jogador.status}`);
        this._blockPerformance.setData([
            { title: 'Sensores', x: x, y: this._sensorPerf, style: { line: 'yellow' } },
            { title: 'Jogador', x: x, y: this._jogadorPerf, style: { line: 'green' } },
            { title: 'UI', x: x, y: this._UIPerf, style: { line: 'white' } }
        ]);

        // Renderiza atualizações
        this._screen.render();
        this.tempoExec = (performance.now() - t0).toFixed(1);
    }
}