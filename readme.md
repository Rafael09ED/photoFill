# Photo Fill

A program to navigate and generate an infinite canvas of photos without using a grid

## Live Preview

### Instructions 

Click and drag to navigate

### [Rectangles Demoing Concept](https://rafaeldejesus.com/photoFill/)

![Rectangles](https://github.com/Rafael09ED/photoFill/blob/gh-pages/demo/rafaeldejesus.com_photoFill_.png?raw=true)

### [Images Demo](https://rafaeldejesus.com/photoFill/alt) 
  * Currently slow to load
  * Currently streches images to fit

![Images](https://github.com/Rafael09ED/photoFill/blob/gh-pages/demo/rafaeldejesus.com_photoFill_alt_.png?raw=true)

## How it works

Perimeter is stored as an array of points in a clockwise order. This defines the shape simply and you can determine which direction is the inside by what is on the right side of the line (while traveling the array).

There are three rules for placing rectangles
- Place anywhere on convex line
- Concaves (corners) must be filled in the corner
- Concaves from three lines (gulfs) must be filled first

Rules were created to avoid a girdlike view and to minimize scaling or stretching. 

## Notes

* Currently slow performance once many squares are created.
  * One option to fix this is to remove squares that are far enough away
    * They could be kept in memory or deleted entirely depending on if persistance is wanted
* There is an issue where once the offset is far enough and the direction changes, long strips of concave areas are created resulting in long columns or rows of rectangles.
  * This can be fixed by filling in more of the canves before loading the area but that solution is computationally expensive
* Not written well for async
* The algorithm for calculating points is inefficient
  * Entire perimeter is checked for errors when a value is added locally
  * Small optimizations could be made in multiple areas
    * Viewport fill checking
    * Potentially finding place to add next rectangle
* Improvements could be made in:
  * Better fit insertions by selecting from batches
  * Updating viewport
    * Loop checks for any viewport movement
  * Package size
    * Library used is webpacked without code splitting
  * Using a [packer](https://github.com/ssbothwell/greedypacker) to fill in concave areas
  * Algorithm for inserting a rectangle. Algorithm is weak
    * Requires a proper ordering of points
    * Points are inserted into perimeter and then require checking and removing inconsistencies

## To Do

* Write Tests
* Convert implementation into a class
* Convert to async
* Accept photo feeds

## Ideas

* videos and gifs autoplay, 
* mouse over for sound, 
* tagging abilities, 
* clustering areas based on categories
* 3d offsets or movment as a method of browsing 

## Resources for development

* https://webpack.js.org/guides/getting-started/
* https://webpack.js.org/guides/typescript/
* https://konvajs.org/docs/sandbox/Video_On_Canvas.html

### To Look At

* https://webpack.js.org/guides/code-splitting/

### Algorithms Used

* Is point in ploygon: https://stackoverflow.com/a/63436180/4747092  
