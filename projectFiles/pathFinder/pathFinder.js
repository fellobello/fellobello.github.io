let rows, cols;
let cellWidth, cellHeight;
let noiseScale = 0.03;
let startCell, goalCell;
let whiteCells = [];
let numCells = 100;
let sizeCanvas = 800;

const colors = {
    background: '#E9C46A', // Mustard yellow
    obstacle: '#2A9D8F', // Teal
    open: '#F4F1DE', // Light cream
    start: '#5accfa', // cyan
    goal: '#E76F51', // Burnt sienna
    path: '#b4a7d6', // Beige
    border: '#A8D5BA' // Mint green
};
  
function drawCell(x, y, width, height, fillColor, strokeColor = colors.border) {
    fill(fillColor);
    if (strokeColor) {
      stroke(strokeColor);
      strokeWeight(0.2); // Thin stroke for a subtle border
    } else {
      noStroke();
    }
    rect(x, y, width, height, 5); // Slight rounding of corners
}
  
function setup() {
  createCanvas(sizeCanvas, sizeCanvas, WEBGL);
  background(colors.background);
  translate(-width / 2, -height / 2);
  rows = numCells;
  cols = numCells;
  cellWidth = width / cols;
  cellHeight = height / rows;

  // Clear previous state if necessary
  whiteCells = [];
  console.log("Setting up the grid...");
  generateGrid(); // Note: generateGrid might need adjustments to return a boolean status
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
            drawCell(x, y, cellWidth, cellHeight, fillColor); // Updated to use drawCell
            if (noiseValue <= 0.5) {
                whiteCells.push({i, j});
            }
        }
    }
    
    do {
      startCell = random(whiteCells);
      goalCell = random(whiteCells.filter(cell => cell !== startCell));
    } while (!isConnected(startCell, goalCell, whiteCells));
  
    colorCell(startCell, colors.start); // Use the start color
    colorCell(goalCell, colors.goal); // Use the goal color
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
  let iterations = 0; // Initialize an iteration counter
  const maxIterations = 100000; // Set a maximum number of iterations to prevent infinite loops

  while (openList.length > 0) {
      iterations++; // Increment the iteration counter
      if (iterations > maxIterations) {
          console.log("Max iterations reached. Unable to find a path.");
          return null; // Return null or an appropriate value to indicate failure
      }

      let currentCell = openList.shift(); // Take the first cell from the list
    
      // Add the current cell to the path
      path.push(currentCell);
    
      // Check if we've reached the goal
      if (currentCell.i === goalCell.i && currentCell.j === goalCell.j) {
          console.log("Goal reached!");
          break;
      }
    
      // Get neighbors of the current cell
      let neighbors = getNeighbors(currentCell, grid, visited);
    
      // If there are no neighbors, it's a dead end; backtrack by removing the last cell from the path
      if (neighbors.length === 0) {
          path.pop();
          if (path.length > 0) {
              openList.unshift(path[path.length - 1]); // Revisit the previous cell
          }
          continue;
      }
    
      // Sort neighbors by their distance to the goal (heuristic)
      neighbors.sort((a, b) => manhattanDistance(a, goalCell) - manhattanDistance(b, goalCell));
    
      // Add the closest neighbor to the open list to explore next
      openList.unshift(neighbors[0]);
    
      // Mark the chosen neighbor as visited
      visited.add(`${neighbors[0].i},${neighbors[0].j}`);
  }

  if (iterations <= maxIterations) {
      console.log("Path calculated:", path);
      return path;
  } else {
      // This else block might never be reached due to the return statement above,
      // but it's here to illustrate handling of different outcomes.
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
    let index = 1; // Start from the second element to preserve the start cell color
    
    function animateStep() {
      if (index < path.length) { // Ensure we animate till the last cell (inclusive)
        let cell = path[index];
        colorCell(cell, colors.path); // Use the path color
        console.log("Animating cell:", cell);
        index++;
        requestAnimationFrame(animateStep);
      } else {
        // Optionally, recolor the goal cell to ensure it stands out at the end of the animation
        colorCell(goalCell, colors.goal);
        console.log("Animation completed.");
      }
    }
    
    animateStep();
}
  
function startPathfinding() {
  let path = calculatePath(startCell, goalCell, whiteCells);
  if (path === null) {
      // If pathfinding failed, restart the simulation
      console.log("Pathfinding failed. Restarting the simulation...");
      setTimeout(setup, 1000); // Restart after a short delay to avoid freezing
  } else {
      // If a path is found, proceed with animation
      animatePath(path);
  }
}

function isConnected(startCell, goalCell, grid) {
    let visited = new Set([`${startCell.i},${startCell.j}`]);
    let queue = [startCell];
  
    while (queue.length > 0) {
      let cell = queue.shift();
      if (cell.i === goalCell.i && cell.j === goalCell.j) {
        return true; // Path found
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
  
    return false; // No path found
}
  