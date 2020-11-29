import Konva from 'konva';
import Knova from 'konva';

const width = window.innerWidth;
const height = window.innerHeight;

interface RectProps{
    height: number,
    width: number
}

interface Point {
    x: number,
    y: number
}

interface SquareCornerDirection {
    NE: boolean,
    SE: boolean,
    SW: boolean,
    NW: boolean
}

interface CardinalDirection {
    N: boolean,
    E: boolean,
    S: boolean,
    w: boolean
}

interface PerimeterPoint extends Point {
    internalDir: SquareCornerDirection
}
/* 
 * Each point contains x, y, and insideDir
 *      internalDir stores NE, SE, SW, NW as booleans 
 */

var perimeterPoints: PerimeterPoint[] = [];


function randColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)},${50 + Math.floor(Math.random() * 50)}%,${25 + Math.floor(Math.random() * 50)}%)`
}

function genRectData(): RectProps {
    var scaleDown = 3;
    var minSize = 200;
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


function getPointsFromRectangle(x: number, y: number, width: number, height: number): PerimeterPoint[]{
    return [
        {x, y, internalDir: {NE: false, SE: true, SW: false, NW:false}},
        {x: x + width, y, internalDir: {NE: false, SE: false, SW: true, NW:false}},
        {x, y: y + height, internalDir: {NE: true, SE: false, SW: false, NW:false}},
        {x: x + width, y: y + height, internalDir:{NE: false, SE: false, SW: false, NW:true}}
    ]; 
}

function addRectToPerimter(x: number, y: number, width: number, height: number){
    // TODO: Remove overlaping lines (maybe I can get away with just removing overlapping points)
    perimeterPoints.push(...getPointsFromRectangle(x, y, width, height));
}

function createFirst(data: RectProps) : Knova.Rect {
    var rect = new Konva.Rect({
        x: stage.width() / 2 - data.width / 2,
        y: stage.height() / 2 - data.height /2,
        height: data.height,
        width: data.width,
        fill: randColor(),
        stroke: 'black',
        strokeWidth: 1,
    });
    addRectToPerimter(rect.x(), rect.y(), rect.width(), rect.height())
    return rect;
}



function dist(a: Point, b: Point) : number { 
    return Math.sqrt( Math.pow( a.x - b.x,2) + Math.pow(a.y - b.y, 2) );
 }

/* 
 * 
 * point: {x,y} point to search for next 
 * Returns points and direction for next rectangle to place
 */
function findPlaceForNextRect(point : Point){
    // TODO: real Algo
    // find points
    var closest = {
        a: perimeterPoints[0], 
        b: perimeterPoints[1], 
        distance: dist(perimeterPoints[0], point) + dist(perimeterPoints[1], point), 
        index: 0
    };
    var a = perimeterPoints[1];
    for(var i = 2; i <= perimeterPoints.length; i++){
        var b = perimeterPoints[i % perimeterPoints.length];
        console.log("a,b", a, b);
        var distance = dist(a, point) + dist(b, point); 
        if (distance < closest.distance){
            closest.a = a;
            closest.b = b;
            closest.distance = distance;
            closest.index = i - 1;
        }
        a = b;
    }

    var line = new Konva.Line({
        points: [closest.a.x, closest.a.y, closest.b.x, closest.b.y],
        stroke: 'red',
        strokeWidth: 15,
    });
    layer.add(line);


    console.log(closest);
    // find direction?
    var direction = {
        N: closest.a.y == closest.b.y && !((closest.a.internalDir.NW && closest.b.internalDir.NE) || (closest.b.internalDir.NW && closest.a.internalDir.NE)), 
        E: closest.a.x == closest.b.x && !((closest.a.internalDir.NE && closest.b.internalDir.SE) || (closest.b.internalDir.NE && closest.a.internalDir.SE)), 
        S: closest.a.y == closest.b.y && !((closest.a.internalDir.SW && closest.b.internalDir.SE) || (closest.b.internalDir.SW && closest.a.internalDir.SE)), 
        W: closest.a.x == closest.b.x && !((closest.a.internalDir.NW && closest.b.internalDir.SW) || (closest.b.internalDir.NW && closest.a.internalDir.SW))
    } // only works for 2
    return {
        perimeterPoints: [closest.a, closest.b],
        direction
    };

}

function addRect(nextRectToAdd: RectProps){
    //pick place to add
        // what will it return? 
            // the 4 corner points?
            // the corner points it needs to fit and direction
                // I like this one the most
    var points = findPlaceForNextRect({x:2000,y:2000});
    // determine needed size
    console.log(points);
    if(points.perimeterPoints.length == 2) {
        if (points.direction.N){
            var rect = new Konva.Rect({
                x: points.perimeterPoints[0].x ,
                y: points.perimeterPoints[0].y - nextRectToAdd.height,
                height: nextRectToAdd.height,
                width: nextRectToAdd.width,
                fill: randColor(),
                stroke: 'black',
                strokeWidth: 1,
            });
            addRectToPerimter(rect.x(), rect.y(), rect.width(), rect.height());
            layer.add(rect);
        } else if (points.direction.E) {
            var rect = new Konva.Rect({
                x: points.perimeterPoints[0].x ,
                y: points.perimeterPoints[0].y - nextRectToAdd.height,
                height: nextRectToAdd.height,
                width: nextRectToAdd.width,
                fill: randColor(),
                stroke: 'black',
                strokeWidth: 1,
            });
            addRectToPerimter(rect.x(), rect.y(), rect.width(), rect.height());
            layer.add(rect);
        } else if (points.direction.S) {
            
        } else if (points.direction.W){ 
            
        }
        

    }
    // create object
    // add to layer
    // add points to perimeter
    
}

function drawPerimeterPoint(point: PerimeterPoint){
    const x = point.x;
    const y = point.y;
    var pointObj = new Konva.Circle({
        x,
        y,
        radius: 6,
        fill: 'black',
        stroke: 'white',
        strokeWidth: 4
    });
    layer.add(pointObj);
    if(point.internalDir.NE){
        var arrow = new Konva.Arrow({
            x,
            y,
            points: [0, 0, 25, -25],
            pointerLength: 10,
            pointerWidth: 10,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1,
        });
        layer.add(arrow);
    }
    if(point.internalDir.SE){
        var arrow = new Konva.Arrow({
            x,
            y,
            points: [0, 0, 25, 25],
            pointerLength: 10,
            pointerWidth: 10,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1,
        });
        layer.add(arrow);
    }
    if(point.internalDir.SW){
        var arrow = new Konva.Arrow({
            x,
            y,
            points: [0, 0, -25, 25],
            pointerLength: 10,
            pointerWidth: 10,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1,
        });
        layer.add(arrow);
    }
    if(point.internalDir.NW){
        var arrow = new Konva.Arrow({
            x,
            y,
            points: [0, 0, -25, -25],
            pointerLength: 10,
            pointerWidth: 10,
            fill: 'black',
            stroke: 'black',
            strokeWidth: 1,
        });
        layer.add(arrow);
    }
}

function drawPerimeterPoints(points: PerimeterPoint[]){
    points.forEach(drawPerimeterPoint);
}

var layer = new Konva.Layer();
var stage = new Konva.Stage({
  container: 'container',
  width: width,
  height: height,
  draggable: true,
});

var batch = generateRectBatchData();

var first = createFirst(batch.shift()!);
layer.add(first);
addRect(batch.shift()!);
drawPerimeterPoints(perimeterPoints);
stage.add(layer);