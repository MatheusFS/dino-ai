const Jimp = require("jimp");
const robot = require("robotjs");

export class LeitorVisual{

    constructor(){
        
        let screenSize = robot.getScreenSize();
    }

    screenCaptureToFile(){

        let capture = robot.screen.capture(0, 0, 100, 100);

        return new Promise((resolve, reject) => {
            new Jimp(capture.width, capture.height, function(err, img) {
                if(err) reject(err); 
                img.bitmap.data = capture.image;
                img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
                  var red   = img.bitmap.data[ idx + 0 ];
                  var blue  = img.bitmap.data[ idx + 2 ];
                  img.bitmap.data[ idx + 0 ] = blue;
                  img.bitmap.data[ idx + 2 ] = red;
                });
                img.write("test/" + (new Date().getTime()) + '.jpg');
                resolve('Imagem criada com sucesso!')
            })
        });
    }
}