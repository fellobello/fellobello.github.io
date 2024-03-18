let rows, cols;
let cellWidth, cellHeight;
let noiseScale = 0.03;
let startCell, goalCell;
let whiteCells = [];
let numCells = 100;
let sizeCanvas = 400;

const colors = {
    background: '#E9C46A', // Mustard yellow
    obstacle: '#2A9D8F', // Teal
    open: '#202227', // Light cream
    start: '#f74fa0', // cyan
    goal: '#E76F51', // Burnt sienna
    path: '#f7e74f', // Beige
    border: '#A8D5BA' // Mint green
};
  
function drawCell(x, y, width, height, fillColor, strokeColor = colors.border) {
    fill(fillColor);
    if (strokeColor) {
      stroke(strokeColor);
      strokeWeight(0.2); 
    } else {
      noStroke();
    }
    rect(x, y, width, height, 5); 
}
  
function setup() {
  createCanvas(sizeCanvas, sizeCanvas, WEBGL);
  background(colors.background);
  translate(-width / 2, -height / 2);
  rows = numCells;
  cols = numCells;
  cellWidth = width / cols;
  cellHeight = height / rows;
  createRestartButton();

  whiteCells = [];
  console.log("Setting up the grid...");
  generateGrid(); 
  console.log("Starting pathfinding...");
  startPathfinding();
}

function generateGrid() {
    whiteCells = [];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let x = j * cellWidth;
            let y = i * cellHeight;
            let noiseValue = noise(j * noiseScale, i * noiseScale);
            let fillColor = noiseValue > 0.5 ? colors.obstacle : colors.open;
            drawCell(x, y, cellWidth, cellHeight, fillColor); 
            if (noiseValue <= 0.5) {
                whiteCells.push({i, j});
            }
        }
    }
    
    do {
      startCell = random(whiteCells);
      goalCell = random(whiteCells.filter(cell => cell !== startCell));
    } while (!isConnected(startCell, goalCell, whiteCells));
  
    colorCell(startCell, colors.start); 
    colorCell(goalCell, colors.goal); 
}
  
function colorCell(cell, col) {
    let x = cell.j * cellWidth;
    let y = cell.i * cellHeight;
    drawCell(x, y, cellWidth, cellHeight, col);
}

function calculatePath(startCell, goalCell, grid) {
  console.log("Calculating path from start to goal...");

  let openList = [startCell];
  let path = [];
  let visited = new Set([`${startCell.i},${startCell.j}`]);
  let iterations = 0; 
  const maxIterations = 100000; 

  while (openList.length > 0) {
      iterations++; 
      if (iterations > maxIterations) {
          console.log("Max iterations reached. Unable to find a path.");
          return null; 
      }

      let currentCell = openList.shift();
    
      path.push(currentCell);
    
      if (currentCell.i === goalCell.i && currentCell.j === goalCell.j) {
          console.log("Goal reached!");
          break;
      }
    
      let neighbors = getNeighbors(currentCell, grid, visited);
    
      if (neighbors.length === 0) {
          path.pop();
          if (path.length > 0) {
              openList.unshift(path[path.length - 1]); 
          }
          continue;
      }
    
      neighbors.sort((a, b) => manhattanDistance(a, goalCell) - manhattanDistance(b, goalCell));
    
      openList.unshift(neighbors[0]);
    
      visited.add(`${neighbors[0].i},${neighbors[0].j}`);
  }

  if (iterations <= maxIterations) {
      console.log("Path calculated:", path);
      return path;
  } else {
      // this else block might never be reached due to the return statement above
  }
}
  
function getNeighbors(cell, grid, visited) {
    let directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // Down, Up, Right, Left
    let neighbors = [];
  
    directions.forEach(([di, dj]) => {
      let newI = cell.i + di, newJ = cell.j + dj;
      if (newI >= 0 && newI < rows && newJ >= 0 && newJ < cols && grid.some(g => g.i === newI && g.j === newJ) && !visited.has(`${newI},${newJ}`)) {
        neighbors.push({i: newI, j: newJ});
      }
    });
  
    return neighbors;
} 
  
function manhattanDistance(cellA, cellB) {
    return Math.abs(cellA.i - cellB.i) + Math.abs(cellA.j - cellB.j);
}
  
function animatePath(path) {
    console.log("Animating path...");
    let index = 1; 
    
    function animateStep() {
      if (index < path.length) { 
        let cell = path[index];
        colorCell(cell, colors.path); 
        console.log("Animating cell:", cell);
        index++;
        requestAnimationFrame(animateStep);
      } else {
        colorCell(goalCell, colors.goal);
        console.log("Animation completed.");
      }
    }
    
    animateStep();
}
  
function startPathfinding() {
  let path = calculatePath(startCell, goalCell, whiteCells);
  if (path === null) {
      console.log("Pathfinding failed. Restarting the simulation...");
      setTimeout(setup, 1000); // restart after a short delay to avoid freezing
  } else {
      animatePath(path);
  }
}

function isConnected(startCell, goalCell, grid) {
    let visited = new Set([`${startCell.i},${startCell.j}`]);
    let queue = [startCell];
  
    while (queue.length > 0) {
      let cell = queue.shift();
      if (cell.i === goalCell.i && cell.j === goalCell.j) {
        return true; // path found
      }
  
      let neighbors = getNeighbors(cell, grid, visited);
      for (let neighbor of neighbors) {
        let key = `${neighbor.i},${neighbor.j}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(neighbor);
        }
      }
    }
  
    return false;
}

function createRestartButton() {
  let restartButton = createButton('Restart Simulation');
  restartButton.position(20, sizeCanvas + 20); // Adjust as necessary
  restartButton.mousePressed(restartSimulation);
}

function restartSimulation() {
  // Clear the canvas and re-initialize the simulation setup
  clear(); // Clear the canvas
  setup(); // Call setup to restart the simulation

  // Alternatively, if you don't want to re-create the canvas and other setup steps,
  // you could directly call the functions that initialize the simulation state,
  // like generateGrid() and startPathfinding(), and any other necessary state resets.
}