import Konva from 'konva';
import { add } from 'lodash';

const canvas_width = window.innerWidth;
const canvas_height = window.innerHeight;

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
    W: boolean
}

enum RelativeDirection {
    Left = -1,
    Forward,
    Right,
    Back
}


interface PerimeterPoint extends Point {
    internalDir: SquareCornerDirection
}
/* 
 * Each point contains x, y, and insideDir
 *      internalDir stores NE, SE, SW, NW as booleans 
 */

let perimeterPoints: PerimeterPoint[] = [];


function randColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)},${50 + Math.floor(Math.random() * 50)}%,${25 + Math.floor(Math.random() * 50)}%)`
}

function genRectData(): RectProps {
    let scaleDown = 3;
    let minSize = 200;
    let maxSize = Math.min(canvas_height, canvas_width);
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

function rotate<T>(arr: T[], count = 1) : T[]{
    return [...arr.slice(count, arr.length), ...arr.slice(0, count)];
};

/*
 * Returns NW point first in clockwise format
 */
function getPointsFromRectangle(x: number, y: number, width: number, height: number): PerimeterPoint[]{ 
    return [
        {x, y, internalDir: {NE: false, SE: true, SW: false, NW:false}},
        {x: x + width, y, internalDir: {NE: false, SE: false, SW: true, NW:false}},
        {x: x + width, y: y + height, internalDir:{NE: false, SE: false, SW: false, NW:true}},
        {x, y: y + height, internalDir: {NE: true, SE: false, SW: false, NW:false}},
    ]; // ordering matters
}

function arePointsEqual(a: Point, b:Point) : boolean {
    return a.x == b.x && a.y == b.y;
}

function joinSquarePoints(a:SquareCornerDirection, b:SquareCornerDirection){
    return {
        NE: a.NE || b.NE,
        SE: a.SE || b.SE,
        SW: a.SW || b.SW,
        NW: a.NW || b.NW
    }
}

function onSameLine(a: Point, b:Point, c:Point) : boolean { // HORIZONTAL OR VERTIRCAL ONLY
    return (a.x == b.x && b.x == c.x) || (a.y == b.y && b.y == c.y);
}

function spliceCircular<T>(arr:T[], start: number, remove: number): T[] {
    if (arr.length > start + remove){
        return [...arr.slice(0, start), ...arr.slice(start + remove, arr.length)];
    }
    console.log("vals", start, remove, arr.length,  (start + remove) % arr.length)
    return arr.slice((start + remove) % arr.length, start);
}

function getAbsoluteAngle(a: Point, b:Point) : number{
    const relPoint : Point = {x: b.x - a.x, y: b.y - a.y};
    const degree = toDegrees(Math.atan2(-relPoint.y, relPoint.x)); // neg y because of inverted y axis
    console.log("a", a, "b", b, relPoint, degree);
    return (degree < 0) ? degree + 360 : degree;
}

/*
 *  Unit Circle x axis is base angle
 */
function isAngleToRightOfPoints(a: Point, b: Point, c:Point, angle: number): boolean {
    //let clockwiseAngle = toDegrees(calculateAngle(a, b, c)); comparing relative to absolte... bad idea
    let ba_angle = getAbsoluteAngle(b,a);
    let bc_angle = getAbsoluteAngle(b,c);

    if (bc_angle < ba_angle) 
        bc_angle += 360;
    if (angle < ba_angle)
        angle += 360;

    const answer = ba_angle <= angle && angle <= bc_angle

    console.log("angle", a, b, c, ba_angle, bc_angle, angle, answer);
    return answer;
}

function calculateInternalDir(p : Point, prev: Point, next: Point) : SquareCornerDirection {
    return {
        NE: isAngleToRightOfPoints(prev, p, next, 0 * 90 + 45),
        NW: isAngleToRightOfPoints(prev, p, next, 1 * 90 + 45),
        SW: isAngleToRightOfPoints(prev, p, next, 2 * 90 + 45),
        SE: isAngleToRightOfPoints(prev, p, next, 3 * 90 + 45)  
    }
}

function addRectToPerimter(x: number, y: number, width: number, height: number, indexInPerimiterList: number, rotateCount: number){
    // TODO: Remove overlaping lines (maybe I can get away with just removing overlapping points)
    console.assert(perimeterPoints.length > 0, "Perimeter has no points!");
    console.log(perimeterPoints);
    perimeterPoints.splice(indexInPerimiterList, 0, ...rotate(getPointsFromRectangle(x, y, width, height), rotateCount));
    for (let i = 0; i < perimeterPoints.length; i++) {
        const a = perimeterPoints[i];
        const b_i = (i + 1) % perimeterPoints.length;
        const b = perimeterPoints[b_i];
        const c_i = (i + 2) % perimeterPoints.length;
        const c = perimeterPoints[c_i];
        const d_i = (i + 3) % perimeterPoints.length;
        const d = perimeterPoints[d_i];
        
       
        // remove overlapping points
        if (arePointsEqual(b, c)){
            if (!onSameLine(a, b, d)){
                perimeterPoints.splice(b_i,1);
                perimeterPoints[b_i].internalDir = joinSquarePoints(b.internalDir, c.internalDir);
                i--;
                continue;
            }
            perimeterPoints = spliceCircular(perimeterPoints, b_i, 2);
        }
    }
    for (let i = 0; i < perimeterPoints.length; i++) {
        const a = perimeterPoints[i];
        const b_i = (i + 1) % perimeterPoints.length;
        const b = perimeterPoints[b_i];
        const c_i = (i + 2) % perimeterPoints.length;
        const c = perimeterPoints[c_i];
        console.log("index", b_i);
        b.internalDir = calculateInternalDir(b, a, c);
        
    }
}

function createFirst(data: RectProps) : Konva.Rect {
    let rect = new Konva.Rect({
        x: stage.width() / 2 - data.width / 2,
        y: stage.height() / 2 - data.height /2,
        height: data.height,
        width: data.width,
        fill: randColor(),
        stroke: 'black',
        strokeWidth: 1,
    });
    //addRectToPerimter(rect.x(), rect.y(), rect.width(), rect.height(), 0, 0);
    perimeterPoints = getPointsFromRectangle(rect.x(), rect.y(), rect.width(), rect.height());
    return rect;
}


function distance(a: Point, b: Point) : number { 
    const dist =  Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2))
    return dist;
}

function calculateDistance(a: Point, b: Point, p: Point){
    let dist = distance(a, p) + distance(b, p);
    return dist; 
}

function normaliseToInteriorAngle(angle : number) { // Radians
	if (angle < 0) {
		angle += (2*Math.PI)
	}
	if (angle > Math.PI) {
		angle = 2*Math.PI - angle
	}
	return angle
}

function calculateAngle(p1: Point, center: Point, p2: Point) { // Radians
	const transformedP1 : Point = {x: p1.x - center.x, y: p1.y - center.y};
	const transformedP2 : Point = {x: p2.x - center.x, y: p2.y - center.y};

	const angleToP1 = Math.atan2(transformedP1.y, transformedP1.x);
	const angleToP2 = Math.atan2(transformedP2.y, transformedP2.x);

	return angleToP1 - angleToP2
}

function toDegrees(radians: number) {
	return 360 * radians / (2 * Math.PI)
}

function dirOfNextPoint(previous: Point, current: Point, next: Point) : RelativeDirection {
    const degrees = toDegrees(calculateAngle(previous, current, next));
    if (degrees < 90 - 45) return RelativeDirection.Back;
    if (degrees < 180 - 45) return RelativeDirection.Left;
    if (degrees < 270 - 45) return RelativeDirection.Forward;
    if (degrees < 360 - 45) return RelativeDirection.Right;
    return RelativeDirection.Back;

}

function findPlaceForNextRect(point : Point): {
        perimeterPoints: PerimeterPoint[], 
        direction: CardinalDirection,
        index: number}{
    // TODO: real Algo
    // find points
    let closest = {
        a: perimeterPoints[0], 
        b: perimeterPoints[1], 
        distance: calculateDistance(perimeterPoints[0], perimeterPoints[1], point), 
        index: 0
    };
    let a = perimeterPoints[0];
    for(let i = 1; i <= perimeterPoints.length; i++){
        let b = perimeterPoints[i % perimeterPoints.length];
        let distance = calculateDistance(a, b, point); 
        if (distance < closest.distance){
            closest.a = a;
            closest.b = b;
            closest.distance = distance;
            closest.index = i - 1;
        }
        a = b;
    }

    let line = new Konva.Line({
        points: [closest.a.x, closest.a.y, closest.b.x, closest.b.y],
        stroke: 'red',
        strokeWidth: 15,
    });
    layer.add(line);


    // find direction?
    let direction = {
        N: closest.a.y == closest.b.y && !((closest.a.internalDir.NW && closest.b.internalDir.NE) || (closest.b.internalDir.NW && closest.a.internalDir.NE)), 
        E: closest.a.x == closest.b.x && !((closest.a.internalDir.NE && closest.b.internalDir.SE) || (closest.b.internalDir.NE && closest.a.internalDir.SE)), 
        S: closest.a.y == closest.b.y && !((closest.a.internalDir.SW && closest.b.internalDir.SE) || (closest.b.internalDir.SW && closest.a.internalDir.SE)), 
        W: closest.a.x == closest.b.x && !((closest.a.internalDir.NW && closest.b.internalDir.SW) || (closest.b.internalDir.NW && closest.a.internalDir.SW))
    } // only works for 2
    return {
        perimeterPoints: [closest.a, closest.b],
        direction,
        index: closest.index
    };

}
function pickRandomPointOnLine(points: Point[]): Point {
    const x_size = points[1].x - points[0].x;
    const y_size = points[1].y - points[0].y; 
    return {
        x: points[0].x + x_size * Math.random(), 
        y: points[0].y + y_size * Math.random(),
    }
}

function addRect(nextRectToAdd: RectProps){
    //pick place to add
        // what will it return? 
            // the 4 corner points?
            // the corner points it needs to fit and direction
                // I like this one the most
    const addPoint : Point = {x:Math.random()*canvas_width,y:Math.random() * canvas_height};
    drawPoint(addPoint, "blue", "red");
    let points = findPlaceForNextRect(addPoint);
    // determine needed size

    if(points.perimeterPoints.length == 2) {
        const startPointOnLine = pickRandomPointOnLine(points.perimeterPoints);
        if (points.direction.N){
            let rect = new Konva.Rect({
                x: startPointOnLine.x ,
                y: startPointOnLine.y - nextRectToAdd.height,
                height: nextRectToAdd.height,
                width: nextRectToAdd.width,
                fill: randColor(),
                stroke: 'black',
                strokeWidth: 1,
            });
            addRectToPerimter(rect.x(), rect.y(), rect.width(), rect.height(), points.index, 0);
            layer.add(rect);
        } else if (points.direction.E) {
            let rect = new Konva.Rect({
                x: startPointOnLine.x ,
                y: startPointOnLine.y ,
                height: nextRectToAdd.height,
                width: nextRectToAdd.width,
                fill: randColor(),
                stroke: 'black',
                strokeWidth: 1,
            });
            addRectToPerimter(rect.x(), rect.y(), rect.width(), rect.height(), points.index + 1, 0);
            layer.add(rect);
        } else if (points.direction.S) {
            let rect = new Konva.Rect({
                x: startPointOnLine.x - nextRectToAdd.width,
                y: startPointOnLine.y ,
                height: nextRectToAdd.height,
                width: nextRectToAdd.width,
                fill: randColor(),
                stroke: 'black',
                strokeWidth: 1,
            });
            addRectToPerimter(rect.x(), rect.y(), rect.width(), rect.height(), points.index + 1, 1);
            layer.add(rect);
        } else if (points.direction.W){ 
            let rect = new Konva.Rect({
                x: startPointOnLine.x - nextRectToAdd.width,
                y: startPointOnLine.y - nextRectToAdd.height,
                height: nextRectToAdd.height,
                width: nextRectToAdd.width,
                fill: randColor(),
                stroke: 'black',
                strokeWidth: 1,
            });
            addRectToPerimter(rect.x(), rect.y(), rect.width(), rect.height(), points.index + 1, 2);
            layer.add(rect);
        }
    }
    // create object
    // add to layer
    // add points to perimeter
    
}

function drawPoint(point: Point, fill: string, stroke: string, label?:string) {
    const x = point.x;
    const y = point.y;
    let pointObj = new Konva.Circle({
        x,
        y,
        radius: 6,
        fill,
        stroke,
        strokeWidth: 4
    });
    layer.add(pointObj);
    if(label){
        let text = new Konva.Text({
            x: x + 10,
            y: y - 20,
            text: label,
            fontSize: 20,
            fontFamily: 'Calibri',
            fill: 'black'
          });
          layer.add(text);
    }
  
}


function drawPerimeterPoint(point: PerimeterPoint, label? :string){
    const x = point.x;
    const y = point.y;
    if (label)
        drawPoint(point, "white", "black", label);
    else 
        drawPoint(point, "white", "black");

    if(point.internalDir.NE){
        let arrow = new Konva.Arrow({
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
        let arrow = new Konva.Arrow({
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
        let arrow = new Konva.Arrow({
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
        let arrow = new Konva.Arrow({
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
    for (let i = 0; i < points.length; i++) {
        let cur = points[i];
        drawPerimeterPoint(cur, i + "");
    }
}

let layer = new Konva.Layer();
let stage = new Konva.Stage({
  container: 'container',
  width: canvas_width,
  height: canvas_height,
  draggable: true,
});

let batch = generateRectBatchData();

let first = createFirst(batch.shift()!);
layer.add(first);
addRect(batch.shift()!);
console.log(perimeterPoints);
drawPerimeterPoints(perimeterPoints);
stage.add(layer);