var width = window.innerWidth;
var height = window.innerHeight;

function randColor(){
    return `hsl(${Math.floor(Math.random() * 360)},${50 + Math.floor(Math.random() * 50)}%,${25 + Math.floor(Math.random() * 50)}%)`
}

function genRectData(){
    var scaleDown = 3;
    var minSize = 100;
    var maxSize = 1920 - minSize;
    return {
        height: Math.floor((minSize + Math.random() * maxSize)/scaleDown),
        width: Math.floor((minSize + Math.random() * maxSize)/scaleDown)
    }
}

function generateRectBatchData(){
    let array = []
    for (let i = 0; i < 25; i++)
        array.push(genRectData());
    return array
}

var layer = new Konva.Layer();
var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height,
  draggable: true,
});


var rectangle = new Konva.Rect({
  x: stage.width() / 2 - 50,
  y: stage.height() / 2 - 50,
  height: 100,
  width: 100,
  fill: randColor(),
  stroke: 'black',
  strokeWidth: 1,
});


layer.add(rectangle);
stage.add(layer);