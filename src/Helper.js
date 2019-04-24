export class Helper {

    constructor() {

        throw new Error('Não pode instânciar o Helper');
    }

    static array_mode(arr) {
        var mode = {};
        var max = 0, count = 0;

        arr.forEach(function (e) {
            if (mode[e]) { mode[e]++; }
            else { mode[e] = 1; }

            if (count < mode[e]) {
                max = e;
                count = mode[e];
            }
        });

        return max;
    }

    static pointsInside(start, end) {

        let points = [];

        for (let i = start[0]; i <= end[0]; i++) {
            for (let j = start[1]; j <= end[1]; j++) {
                points.push({ X: i, Y: j });
            }
        }
        return points;
    }

    static getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
      }

    static pluck(prop, array){

        let result = [];
        array.forEach(element => {
            if(!result.includes(element[prop])) result.push(element[prop])
        });
        return result;
    }
}