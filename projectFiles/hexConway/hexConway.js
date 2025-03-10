//at 2,3,6 the stable organisms have different periods, some 2, 3, 4 or 5
let grid;
let cols;
let rows;
let radius = 20; // Reduced radius
let hexHeight;
let born = 2; // num of neighbors for a cell to be "born"
let minSurvive = 3; // min neighbors for a cell to survive
let maxSurvive = 6; // max neighbors for a cell to survive
let frameRateSlider;
let fadeDuration = 30; // generations before a cell fades completely
let bornSelect, minSurviveSelect, maxSurviveSelect, resetButton;
let aliveColor, midFadeColor, finalFadeColor;

function setup() {
  createCanvas(800, 600, "canvas-container");
  console.log("Canvas created:", canvas); // Check if canvas is valid
  hexHeight = sqrt(3) * radius;
  cols = floor(width / (1.5 * radius)) + 2;
  rows = floor(height / hexHeight) + 3;
  grid = createGrid(cols, rows);

  textSize(8);
  textAlign(CENTER, CENTER);

  // Get references to existing HTML elements
  frameRateSlider = document.getElementById("frameRateSlider");
  bornSelect = document.getElementById("bornSelect");
  minSurviveSelect = document.getElementById("minSurviveSelect");
  maxSurviveSelect = document.getElementById("maxSurviveSelect");
  resetButton = document.getElementById("resetButton");

  // Populate bornSelect
  for (let i = 1; i <= 6; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.text = i;
      bornSelect.appendChild(option);
  }
  bornSelect.value = born; // Set initial value

  // Populate minSurviveSelect
  for (let i = 1; i <= 6; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.text = i;
      minSurviveSelect.appendChild(option);
  }
  minSurviveSelect.value = minSurvive; // Set initial value

  // Populate maxSurviveSelect
  for (let i = 1; i <= 6; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.text = i;
      maxSurviveSelect.appendChild(option);
  }
  maxSurviveSelect.value = maxSurvive; // Set initial value

  // Use standard event listeners
  resetButton.addEventListener("click", resetGrid);
  bornSelect.addEventListener("change", updateBorn);
  minSurviveSelect.addEventListener("change", updateMinSurvive);
  maxSurviveSelect.addEventListener("change", updateMaxSurvive);

  aliveColor = color("rgb(247,255,153)");
  midFadeColor = color("rgb(75,166,111)");
  finalFadeColor = color("rgb(3,49,114)");
}

function updateBorn() {
  born = parseInt(bornSelect.value());
}

function updateMinSurvive() {
  minSurvive = parseInt(minSurviveSelect.value());
}

function updateMaxSurvive() {
  maxSurvive = parseInt(maxSurviveSelect.value());
}

// define resetGrid function to reset simulation
function resetGrid() {
  grid = createGrid(cols, rows);
}

function updateMaxSurvive() {
  maxSurvive = parseInt(maxSurviveSelect.value());
}

function draw() {
  console.log("Draw function called");
  background(100); // darker background
  frameRate(frameRateSlider.value);

  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      let x = col * 1.5 * radius;
      let y = row * hexHeight + (col % 2) * (hexHeight / 2);
      let cell = grid[col][row];
      if (cell.state == 1) {
        fill(aliveColor); // use predefined alive color
      } else {
        // calculate fade step to determine which color to use
        let fadeStep = cell.deadFor / fadeDuration;
        if (fadeStep <= 0.5) {
          // first half of the fade duration
          fill(lerpColor(color("orange"), midFadeColor, fadeStep * 2)); // transition to mid fade color
        } else {
          // second half of the fade duration
          fill(lerpColor(midFadeColor, finalFadeColor, (fadeStep - 0.5) * 2)); // Ttransition to final fade color
        }
      }
      stroke(255); // white stroke to make cells pop
      strokeWeight(0.5); // thin stroke to keep it subtle
      drawHexagon(x, y, radius);
    }
  }

  grid = nextGeneration(grid);
}

// initialize grid with objects storing state and dead counter
function createGrid(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < cols; i++) {
    arr[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      arr[i][j] = {
        state: floor(random(2)), // randomly alive or dead
        deadFor: 0, // counter for dead state
      };
    }
  }
  return arr;
}

// calculate next generation of cells based on Game of Life rules
function nextGeneration(grid) {
  let newGrid = createGrid(cols, rows);
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      let cell = grid[col][row];
      let neighbors = getNeighbors(col, row, cols, rows);
      let aliveNeighbors = neighbors.reduce(
        (sum, neighbor) => sum + grid[neighbor.x][neighbor.y].state,
        0
      );

      // rules of Life with additional logic for fading dead cells
      if (cell.state == 0 && aliveNeighbors == born) {
        newGrid[col][row] = { state: 1, deadFor: 0 };
      } else if (
        cell.state == 1 &&
        aliveNeighbors >= minSurvive &&
        aliveNeighbors <= maxSurvive
      ) {
        newGrid[col][row] = { state: 1, deadFor: 0 };
      } else {
        newGrid[col][row] = {
          state: 0,
          deadFor: cell.state == 0 ? cell.deadFor + 1 : 1,
        };
      }
    }
  }
  return newGrid;
}

function drawHexagon(x, y, radius) {
  push();
  translate(x, y);
  beginShape();
  for (let i = 0; i < TWO_PI; i += TWO_PI / 6) {
    let x = cos(i) * radius;
    let y = sin(i) * radius;
    vertex(x, y);
  }
  endShape(CLOSE);
  pop();
}

// adjusted getNeighbors function to include grid boundaries
function getNeighbors(x, y, cols, rows) {
  let neighbors = [];
  if (x % 2 === 0) {
    neighbors = [
      { x: x - 1, y: y - 1 },
      { x: x, y: y - 1 },
      { x: x + 1, y: y - 1 },
      { x: x + 1, y: y },
      { x: x, y: y + 1 },
      { x: x - 1, y: y },
    ];
  } else {
    neighbors = [
      { x: x - 1, y: y },
      { x: x, y: y - 1 },
      { x: x + 1, y: y },
      { x: x + 1, y: y + 1 },
      { x: x, y: y + 1 },
      { x: x - 1, y: y + 1 },
    ];
  }

  return neighbors.filter(
    (neighbor) =>
      neighbor.x >= 0 &&
      neighbor.y >= 0 &&
      neighbor.x < cols &&
      neighbor.y < rows
  );
}
