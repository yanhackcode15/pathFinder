//2d array t store spot info

//forcing file name
const cols = 50;
const rows = 50;
const grid = new Array(cols);
const openSet = [];
const closedSet = [];
let start;
let end;
let w, h;
let path = [];
let running = true;

function estimateCost(a, b) {
  const d = dist(a.i, a.j, b.i, b.j);
  const md = Math.abs(a.i - b.i) + Math.abs(a.j - b.j);
  // return d + md;
  return 2*d;
  // return d;
  // return 100*md;
  // return md + md;
  // return md;
}

class Spot {
  f = 0;
  g = 0;
  h = 0;
  neighbors = [];
  previous;
  wall = false;

  constructor(i, j) {
    this.i = i;
    this.j = j;
    if (random(1) < 0.25 && i > 0 && j > 0 && i < cols - 1 && j < rows - 1) {
      this.wall = true;
    }
  }

  show(colorVal) {
    fill(colorVal);
    if (this.wall) {
      fill(0);
    }
    stroke(0);
    rect(this.i * w, this.j * h, w - 1, h - 1);
  }

  addNeighbors(grid) {
    if (this.i < cols - 1) {
      this.neighbors.push(grid[this.i + 1][this.j]);
    }
    if (this.j < rows - 1) {
      this.neighbors.push(grid[this.i][this.j + 1]);
    }
    if (this.i > 0) {
      this.neighbors.push(grid[this.i - 1][this.j]);
    }
    if (this.j > 0) {
      this.neighbors.push(grid[this.i][this.j - 1]);
    }
  }

  toggle(){
    this.wall = !this.wall;
  }

  setWall(){
    this.wall = true;
  }
  removeWall() {
    this.wall = false;
  }
}
function stopSketch(){
  openSet.length = 0;
  closedSet.length = 0;
  path.length = 0;
  for (let i = 0; i < cols; i++) {
    // grid[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      grid[i][j].removeWall()
    }
  }
}
function resetSketch() {
  
  openSet.length = 0;
  closedSet.length = 0;
  path.length = 0;
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j);
    }
  }
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }
  start = grid[0][0];
  end = grid[cols - 1][rows - 1];
  openSet.push(start);
}
function pauseSketch() {
  running = false;
}
function resumeSketch(){
  running = true;
}

function setup() {
  frameRate(10)
  const resetButton = createButton('Restart');
  resetButton.mousePressed(resetSketch);
  resetButton.style('background-color', 'white');
  resetButton.style('padding', '10px');
  resetButton.style('margin', '10px');
  resetButton.style('width', '100px');

  const stopButton = createButton('Stop');
  stopButton.mousePressed(stopSketch);
  stopButton.style('background-color', 'white');
  stopButton.style('padding', '10px');
  stopButton.style('margin', '10px');
  stopButton.style('width', '100px');

  const pauseButton = createButton('Pause');
  pauseButton.mousePressed(pauseSketch);
  pauseButton.style('background-color', 'white');
  pauseButton.style('padding', '10px');
  pauseButton.style('margin', '10px');
  pauseButton.style('width', '100px');
  const resumeButton = createButton('Resume');
  resumeButton.mousePressed(resumeSketch);
  resumeButton.style('background-color', 'white');
  resumeButton.style('padding', '10px');
  resumeButton.style('margin', '10px');
  resumeButton.style('width', '100px');

  let canvas = createCanvas(400, 400);
  canvas.style('margin', '10px 50px 10px 50px');

  w = width / cols;
  h = height / rows;
  resetSketch();

}

function draw() {
  if(running){
    if (mouseIsPressed) {
      let iClicked = Math.floor(mouseX/w);
      let jClicked = Math.floor((mouseY)/h);
      if(iClicked<cols && jClicked<rows && iClicked>0 && jClicked>0){
        let spotClicked = grid[iClicked][jClicked];
        spotClicked.setWall();
      }
    }
    if (path[path.length] === end) {
      // Best path has already been found
      noLoop();
    }
    findPath();
    background(255);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        grid[i][j].show(color(255));
      }
    }
    
    // color red the steps we have evaluated
    for (let i = 0; i < closedSet.length; i++) {
      closedSet[i].show(color(255, 0, 0));
    }

    // color green the steps that we haven't explored yet
    for (let i = 0; i < openSet.length; i++) {
      openSet[i].show(color(0, 255, 0));
    }

    // Draw the best path
    path.forEach((step, i) => {
      const brightness = Math.floor((i / path.length) * 127);
      step.show(color(brightness, brightness, 255 - brightness));
    });
  }
}

function findPath() {
  // openSet contains all the nodes we have not inspected yet
  if (openSet.length > 0) {
    // Find the shortest (lowest scoring) path
    let bestIndex = 0; // Index in the openSet of the lowest scoring path
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[bestIndex].f) {
        bestIndex = i;
      }
    }

    const current = openSet[bestIndex]; // The next step to evaluate

    if (current === end) {
      // We have reached the destination
      buildPath(current);
      return;
    }

    // Move the current step to the closedSet since we are evaluating it
    // removeFromArray(openSet, current);
    openSet.splice(bestIndex, 1);
    closedSet.push(current); // TODO: Fix adding multiple times to closed

    const neighbors = current.neighbors;
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      // if (!closedSet.includes(neighbor) && !neighbor.wall){
      if (neighbor.wall || closedSet.includes(neighbor)) {
        // Skip walls and already evaluated steps
        continue;
      }

      // tempG = current.g + 1;
      // if (openSet.includes(neighbor)) {
      //   if (tempG < neighbor.g) {
      //     neighbor.g = tempG;
      //   }
      // } else {
      //   neighbor.g = tempG;
      //   openSet.push(neighbor);
      // }

      // neighbor.h = estimateCost(neighbor, end);
      // neighbor.f = neighbor.h + neighbor.g;
      // neighbor.previous = current;
      const nextG = current.g + 1; // Length of the path to the next step
      let takeNextStep = false;
      if (openSet.includes(neighbor)) {
        if (nextG < neighbor.g) {
          takeNextStep = true;
        }
      } else {
          takeNextStep = true;
          neighbor.h = estimateCost(neighbor, end);
          openSet.push(neighbor);
      }
      if (takeNextStep) {
        neighbor.g = nextG;
        neighbor.f = neighbor.h + neighbor.g;
        neighbor.previous = current;
      }
    }

    // Walk back through each step to record the path
    buildPath(current);
  }
}

function buildPath(current) {
  path = [];
  path.push(current);
  let ele = current;
  while (ele.previous) {
    let pre = ele.previous;
    path.push(pre);
    ele = ele.previous;
  }
}
