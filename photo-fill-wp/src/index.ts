import Konva from 'konva';

const canvas_width = window.innerWidth;
const canvas_height = window.innerHeight;

interface Rectangle {
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

enum CardinalDirection {
    NORTH = 1,
    EAST,
    SOUTH,
    WEST
}

enum CardinalCornerDirection {
    NORTH_EAST,
    SOUTH_EAST,
    SOUTH_WEST,
    NORTH_WEST
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
 * perimeterPoints store PerimeterPoints clockwise around the polygon
 */
let perimeterPoints: PerimeterPoint[] = [];


function randColor(): string {
    return `hsl(${Math.floor(Math.random() * 360)},${50 + Math.floor(Math.random() * 50)}%,${25 + Math.floor(Math.random() * 50)}%)`
}

function genRectData(): Rectangle {
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
    let cappedRotateAmount = count % arr.length;
    if (cappedRotateAmount < 0) cappedRotateAmount += arr.length;
    return [...arr.slice(cappedRotateAmount, arr.length), ...arr.slice(0, cappedRotateAmount)];
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
    ]; 
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

function spliceCircular<T>(arr:T[], start: number, remove: number, toInsert: T[] = []): T[] {
    if (arr.length > start + remove){
        return [...arr.slice(0, start), ...toInsert, ...arr.slice(start + remove, arr.length)];
    }
    return [...arr.slice((start + remove) % arr.length, start), ...toInsert];
}

function getAbsoluteAngle(a: Point, b:Point) : number{
    const relPoint : Point = {x: b.x - a.x, y: b.y - a.y};
    const degree = toDegrees(Math.atan2(-relPoint.y, relPoint.x)); // neg y because of inverted y axis
    return (degree < 0) ? degree + 360 : degree;
}

/*
 *  Unit Circle x axis is base angle
 */
function isAngleToRightOfPoints(a: Point, b: Point, c:Point, angle: number): boolean {
    let ba_angle = getAbsoluteAngle(b,a);
    let bc_angle = getAbsoluteAngle(b,c);

    if (bc_angle < ba_angle) 
        bc_angle += 360;
    if (angle < ba_angle)
        angle += 360;

    const answer = ba_angle <= angle && angle <= bc_angle

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

function circularIndex(index: number, length: number): number{
    index = index % length;
    return (index > 0) ? index : index + length;
}

function pointIsHorizontalOrVertical(a: Point, b:Point) : boolean {
    return a.x == b.x || a.y == b.y;
}

function assertPointsAreHorizontalOrVerticalFromEachOther(points: Point[]) {
    for (let i = 0; i < points.length; i++) {
        const a = points[i];
        const b_i = (i + 1) %  points.length;
        const b = points[b_i];
        if (!pointIsHorizontalOrVertical(a,b))
            throw new Error("Assertion that point was in line faild")
    }
}

function addPointsToPerimeter(points: PerimeterPoint[], pointToAddAfter: Point[]){
    if(perimeterPoints.length == 0 || points.length == 0)
        throw new Error("Perimeter has no points!");

    assertPointsAreHorizontalOrVerticalFromEachOther(points);
    assertPointsAreHorizontalOrVerticalFromEachOther(perimeterPoints);

    console.log(perimeterPoints, pointToAddAfter);
    const index = getIndexOfPoint(pointToAddAfter[0]);
    if (pointToAddAfter.length == 2) {
        console.log("two");
        perimeterPoints = spliceCircular(perimeterPoints, circularIndex(index + 1, perimeterPoints.length), 0, points); 
    } else if (pointToAddAfter.length == 3) {
        console.log("three");
        perimeterPoints = spliceCircular(perimeterPoints, circularIndex(index + 1, perimeterPoints.length), 0, points.slice(1));
    } else if (pointToAddAfter.length == 4) {
        console.log("four");
        perimeterPoints = spliceCircular(perimeterPoints, circularIndex(index + 1, perimeterPoints.length), 2, points.slice(0, 3));
    } else 
        throw new Error("Invalid number of points to insert into");


    for (let i = 0; i < perimeterPoints.length; i++) {
        const a = perimeterPoints[i];
        const b_i = (i + 1) % perimeterPoints.length;
        const b = perimeterPoints[b_i];
        const c_i = (i + 2) % perimeterPoints.length;
        const c = perimeterPoints[c_i];
        const d_i = (i + 3) % perimeterPoints.length;
        const d = perimeterPoints[d_i];
        
       
        if (arePointsEqual(a, b)){
            perimeterPoints[i].internalDir = joinSquarePoints(a.internalDir, b.internalDir);
            perimeterPoints = spliceCircular(perimeterPoints, b_i, 1);
            i--;
            continue;
        } 

        // remove backtracking points
        if (dirOfNextPoint(a, b, c) == RelativeDirection.Back){
            perimeterPoints = spliceCircular(perimeterPoints, b_i, 1);
            i--;
            continue;
        }

        if (onSameLine(a, b, c)){
            perimeterPoints = spliceCircular(perimeterPoints, b_i, 1);
            i--;
            continue;
        }
    }
    for (let i = 0; i < perimeterPoints.length; i++) {
        const a = perimeterPoints[i];
        const b_i = (i + 1) % perimeterPoints.length;
        const b = perimeterPoints[b_i];
        const c_i = (i + 2) % perimeterPoints.length;
        const c = perimeterPoints[c_i];
        b.internalDir = calculateInternalDir(b, a, c);
        
    }
}

function createRectangle(point: Point, size: Rectangle, pointRefersTo: CardinalCornerDirection) : [Konva.Rect, PerimeterPoint[]] {
    let topLeft : Point;
    switch (pointRefersTo) {
        case CardinalCornerDirection.NORTH_WEST:
            topLeft = point;
            break;
        case CardinalCornerDirection.NORTH_EAST:
            topLeft = {x: point.x - size.width, y: point.y} ;
            break;
        case CardinalCornerDirection.SOUTH_WEST:
            topLeft = {x: point.x, y: point.y - size.height};
            break;
        case CardinalCornerDirection.SOUTH_EAST:
            topLeft = {x: point.x - size.width, y: point.y - size.height}
            break;
        default: throw new Error("Unimplemented");
    }
    let rect = new Konva.Rect({
        x: topLeft.x,
        y: topLeft.y,
        height: size.height,
        width: size.width,
        fill: randColor(),
        stroke: 'black',
        strokeWidth: 1,
    });
    layer.add(rect);
    let corners = getPointsFromRectangle(rect.x(), rect.y(), rect.width(), rect.height());
    switch (pointRefersTo) {
        case CardinalCornerDirection.NORTH_WEST:
            console.log("NW");
            corners = rotate(corners, 0);
            break;
        case CardinalCornerDirection.SOUTH_WEST:
            console.log("SW");
            corners = rotate(corners, 3);
            break;
        case CardinalCornerDirection.SOUTH_EAST:
            console.log("SE");
            corners = rotate(corners, 2);
            break;
        case CardinalCornerDirection.NORTH_EAST:
            console.log("NE");
            corners = rotate(corners, 1);
            break;
        default: throw new Error("Unimplemented");    
    }
    return [rect, corners];
}

function createFirst(data: Rectangle) : Konva.Rect {
    const x = Math.floor(stage.width() / 2 - data.width / 2);
    const y = Math.floor(stage.height() / 2 - data.height /2);
    const [rect, points] = createRectangle({x,y}, data, CardinalCornerDirection.NORTH_WEST)
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

	const angleToP1 = Math.atan2(-transformedP1.y, transformedP1.x);
	const angleToP2 = Math.atan2(-transformedP2.y, transformedP2.x);

	return angleToP1 - angleToP2
}

function toDegrees(radians: number) {
	return 360 * radians / (2 * Math.PI)
}

function dirOfNextPoint(previous: Point, current: Point, next: Point) : RelativeDirection {
    let  degrees = toDegrees(calculateAngle(previous, current, next));
    if (degrees < 0)
        degrees += 360; 
    if (degrees < 90 - 45) return RelativeDirection.Back;
    if (degrees < 180 - 45) return RelativeDirection.Left;
    if (degrees < 270 - 45) return RelativeDirection.Forward;
    if (degrees < 360 - 45) return RelativeDirection.Right;
    return RelativeDirection.Back;
}

function getOutsideDirectionOfLine(a: Point, b: Point) : CardinalDirection {
    if (a.y == b.y && a.x < b.x)
        return CardinalDirection.NORTH;
    if (a.x == b.x && a.y < b.y)
        return CardinalDirection.EAST;
    if(a.y == b.y && a.x > b.x)
        return CardinalDirection.SOUTH;
    if(a.x == b.x && a.y > b.y)
        return CardinalDirection.WEST
    drawPerimeterPoints(perimeterPoints);
    throw new Error("Cardinal Direction of line not found");
}

function findNextConcaveArea() : PerimeterPoint[] {
    for (let i = 0; i < perimeterPoints.length; i++) {
        const a = perimeterPoints[i];
        const b_i = (i + 1) % perimeterPoints.length;
        const b = perimeterPoints[b_i];
        const c_i = (i + 2) % perimeterPoints.length;
        const c = perimeterPoints[c_i];
        const d_i = (i + 3) % perimeterPoints.length;
        const d = perimeterPoints[d_i];

        if (dirOfNextPoint(a, b, c) == RelativeDirection.Left && dirOfNextPoint(b, c, d) == RelativeDirection.Left){
            // let line = new Konva.Line({
            //     points: [a.x, a.y, b.x, b.y, c.x, c.y, d.x, d.y],
            //     stroke: 'pink',
            //     strokeWidth: 10,
            // });
            // layer.add(line);
            return [a, b, c, d];
        }
    }
    return [];
}

function tryToGetCornerPoint(first: Point, second: Point) : PerimeterPoint []{
    for (let i = 0; i < perimeterPoints.length; i++) {
        const a = perimeterPoints[i];
        const b_i = (i + 1) % perimeterPoints.length;
        const b = perimeterPoints[b_i];
        const c_i = (i + 2) % perimeterPoints.length;
        const c = perimeterPoints[c_i];
        const d_i = (i + 3) % perimeterPoints.length;
        const d = perimeterPoints[d_i];

        if(!arePointsEqual(first, b))
            continue;
        
        if(dirOfNextPoint(a, b, c) == RelativeDirection.Left)
            return [a,b,c];
        else if (dirOfNextPoint(b, c, d) == RelativeDirection.Left)
            return [b, c, d];
        return [];
    }
    return [];
}

function getIndexOfPoint(p: Point) : number{
    for (let i = 0; i < perimeterPoints.length; i++) {
        const a = perimeterPoints[i];
        if (arePointsEqual(a, p))
            return i;
    }
    throw new Error("Point Not Found");
    
}

function findPlaceForNextRect(point : Point): PerimeterPoint[] {
    const nextConcaveArea = findNextConcaveArea();
    if (nextConcaveArea.length != 0){
        return nextConcaveArea;
    }
    
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

    // let line = new Konva.Line({
    //     points: [closest.a.x, closest.a.y, closest.b.x, closest.b.y],
    //     stroke: 'red',
    //     strokeWidth: 15,
    // });
    // layer.add(line);

    
    const cornerPoints = tryToGetCornerPoint(closest.a, closest.b);
    if (cornerPoints.length != 0)  {
        return cornerPoints;
    }

    return [closest.a, closest.b];

}
function pickRandomPointOnLine(points: Point[]): Point {
    const x_size = points[1].x - points[0].x;
    const y_size = points[1].y - points[0].y; 
    return {
        x: Math.floor(points[0].x + x_size * Math.random()), 
        y: Math.floor(points[0].y + y_size * Math.random()),
    }
}

function lenghtOfLine(a: Point, b: Point) {
    if (a.x == b.x) {
        return Math.abs(b.y - a.y);
    }
    if (a.y == b.y) {
        return Math.abs(b.x - a.x);
    }
    throw new Error("Line not horizontal or vertical");
}

function findScalledSize(x1: number, y1: number, x2: number) : number {
    return x2 * y1 / x1;
}

function getSizeGivenSpace(old: Rectangle, points : Point[]) : Rectangle {
    
    const dir = getOutsideDirectionOfLine(points[1], points[2]);
    const lineLength = lenghtOfLine(points[1], points[2]);
    if (true) { //TODO: this section is cheating, find better solution
        const boxHeight = Math.min(lenghtOfLine(points[0], points[1]), lenghtOfLine(points[2], points[3]));
        switch(dir){
            case CardinalDirection.SOUTH: 
            case CardinalDirection.NORTH:
                return {height: boxHeight, width: lineLength};
            case CardinalDirection.EAST: 
            case CardinalDirection.WEST: 
                return {height: lineLength, width: boxHeight};
            
        }
    }
    switch(dir){
        case CardinalDirection.SOUTH: 
        case CardinalDirection.NORTH:{
            const scaledSize = Math.round(findScalledSize(old.width, old.height, lineLength));
            return {height: scaledSize, width: lineLength};
        }
        case CardinalDirection.EAST: 
        case CardinalDirection.WEST: {
            const scaledSize = Math.round(findScalledSize(old.height, old.width, lineLength));
            return {height: lineLength, width: scaledSize};
        }
    }
}

function getWindowCenterPoint() : Point {
    return  {x: -stage.x() + stage.width() / 2, y: -stage.y() + stage.height() / 2};
}


function addRect(nextRectToAdd: Rectangle){
    //const addPoint : Point = {x:Math.random()*canvas_width,y:Math.random() * canvas_height};
    //const addPoint : Point = {x: canvas_width / 2, y: 100};
    const addPoint : Point = getWindowCenterPoint();

    //drawPoint(addPoint, "blue", "red");
    const pointsForNextRect = findPlaceForNextRect(addPoint);

    if(pointsForNextRect.length == 2) {
        const startPointOnLine = pickRandomPointOnLine(pointsForNextRect);
        const dir = getOutsideDirectionOfLine(pointsForNextRect[0], pointsForNextRect[1]);
        const index = getIndexOfPoint(pointsForNextRect[0]);
        let gui_element : Konva.Rect | null = null;
        let rectPoints: PerimeterPoint[] = [];
        switch(dir){
            case CardinalDirection.NORTH:{
                [gui_element, rectPoints] = createRectangle(startPointOnLine, nextRectToAdd, CardinalCornerDirection.SOUTH_WEST);
            }   break;
            case CardinalDirection.EAST: {
                [gui_element, rectPoints] = createRectangle(startPointOnLine, nextRectToAdd, CardinalCornerDirection.NORTH_WEST);
            }   break;
            case CardinalDirection.SOUTH: {
                [gui_element, rectPoints] = createRectangle(startPointOnLine, nextRectToAdd, CardinalCornerDirection.NORTH_EAST);
            }   break;
            case CardinalDirection.WEST: {
                [gui_element, rectPoints] = createRectangle(startPointOnLine, nextRectToAdd, CardinalCornerDirection.SOUTH_EAST);
            }   break;
        }
        if (gui_element != null) {
            addPointsToPerimeter(rectPoints, pointsForNextRect);
            layer.add(gui_element);
        }
    } else if (pointsForNextRect.length == 3) {
        const pointToStartAt = pointsForNextRect[1];
        const firstWallDir = getOutsideDirectionOfLine(pointsForNextRect[0], pointsForNextRect[1]);
        let gui_element : Konva.Rect | null = null;
        let rectPoints: PerimeterPoint[] = [];
        switch(firstWallDir){
            case CardinalDirection.NORTH:{
                [gui_element, rectPoints] = createRectangle(pointToStartAt, nextRectToAdd, CardinalCornerDirection.SOUTH_EAST);
            }   break;
            case CardinalDirection.EAST: {
                [gui_element, rectPoints] = createRectangle(pointToStartAt, nextRectToAdd, CardinalCornerDirection.SOUTH_WEST);
            }   break;
            case CardinalDirection.SOUTH: {
                [gui_element, rectPoints] = createRectangle(pointToStartAt, nextRectToAdd, CardinalCornerDirection.NORTH_WEST);
            }   break;
            case CardinalDirection.WEST: {
                [gui_element, rectPoints] = createRectangle(pointToStartAt, nextRectToAdd, CardinalCornerDirection.NORTH_EAST);
            }   break;
        }
        if (gui_element != null) {
            addPointsToPerimeter(rectPoints, pointsForNextRect);
            layer.add(gui_element);
        }
    } else if (pointsForNextRect.length == 4) {
        // todo: fit to area
        const pointToStartAt = pointsForNextRect[1];
        const middleWallDir = getOutsideDirectionOfLine(pointsForNextRect[1], pointsForNextRect[2]);
        const nextRect = getSizeGivenSpace(nextRectToAdd, pointsForNextRect);
        let gui_element : Konva.Rect | null = null;
        let rectPoints: PerimeterPoint[] = [];
        console.log("areas", nextRect, pointsForNextRect);
        switch(middleWallDir){
            case CardinalDirection.NORTH:{
                [gui_element, rectPoints] = createRectangle(pointToStartAt, nextRect, CardinalCornerDirection.SOUTH_WEST);
            }   break;
            case CardinalDirection.EAST: {
                [gui_element, rectPoints] = createRectangle(pointToStartAt, nextRect, CardinalCornerDirection.NORTH_WEST);
            }   break;
            case CardinalDirection.SOUTH: {
                [gui_element, rectPoints] = createRectangle(pointToStartAt, nextRect, CardinalCornerDirection.NORTH_EAST);
            }   break;
            case CardinalDirection.WEST: {
                [gui_element, rectPoints] = createRectangle(pointToStartAt, nextRect, CardinalCornerDirection.SOUTH_EAST);
            }   break;
        }
        if (gui_element != null) {
            addPointsToPerimeter(rectPoints, pointsForNextRect);
            layer.add(gui_element);
        }
    } else {
        throw new Error("Invalid amount of points from where to place new rectangle");
    }
    
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
    layer.draw();
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
    layer.draw();
}

/** Get relationship between a point and a polygon using ray-casting algorithm
 * @param {{x:number, y:number}} P: point to check
 * @param {{x:number, y:number}[]} polygon: the polygon
 * @returns -1: outside, 0: on edge, 1: inside
 */

function inside(point: Point, vs: Point[]) {
    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    var x = point.x, y = point.y;
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i].x, yi = vs[i].y;
        var xj = vs[j].x, yj = vs[j].y;
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

//  ========== START OF MAIN =========  //

let layer = new Konva.Layer();
let stage = new Konva.Stage({
  container: 'container',
  width: canvas_width,
  height: canvas_height,
  draggable: true,
});

let batch = generateRectBatchData();
let first = createFirst(genRectData());
stage.add(layer);


console.log(perimeterPoints);

function isRenderedWithBorder() : boolean {
    const windowWithBox : Point[] = [
        {x: -100 - stage.x(),                   y: -100 - stage.y() },
        {x: -100 - stage.x() + canvas_width,    y: -100 - stage.y() },
        {x:  100 - stage.x()+ canvas_width,     y:  100 - stage.y() + canvas_height},
        {x: -100 - stage.x(),                   y:  100 - stage.y() + canvas_height}
    ];
    console.log()
    for (let i = 0; i < windowWithBox.length; i++) {
        const element = windowWithBox[i];
        console.log(inside(element, perimeterPoints), windowWithBox);
        if (!inside(element, perimeterPoints))
            return false;
    }
    return true;
}

function updateRender() {
    while (!isRenderedWithBorder()) {
        addRect(genRectData());
    };
    layer.draw();
    setTimeout(updateRender, 500);
}

setTimeout(updateRender, 500);