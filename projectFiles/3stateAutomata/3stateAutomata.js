let grid;
let cols, rows;
let cellSize = 10; // adjust cell size as needed
let rules = []; // define rules
let numRules = 100; 

function setup() {
  createCanvas(900, 600);
  cols = width / cellSize;
  rows = height / cellSize;
  grid = make2DArray(cols, rows);
  // initialize grid with random states
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = floor(random(3));
      //grid[i][j] = floor(random(3));
    }
  }
  // fill in random rules
  initializeRandomRules(numRules);
  
  console.log("Initial grid:", grid);
  console.log("Rules:", rules);
  frameRate(10);
}

function draw() {
  background(240);
  // display grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * cellSize;
      let y = j * cellSize;
      if (grid[i][j] == 0) fill('#DB93B0'); // state 0
      else if (grid[i][j] == 1) fill('#23967F'); // state 1
      else fill('#334B49'); // state 2
      stroke(100);
      rect(x, y, cellSize, cellSize);
    }
  }

  // create new grid for next state
  let next = make2DArray(cols, rows);

  // apply rules to update grid
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      let neighbors = getNeighbors(i, j);
      let nextState = applyRules(state, neighbors);
      next[i][j] = nextState;
    }
  }

  // update grid
  grid = next;
  // terminal debugging for each draw cycle (optional, could be removed for performance)
  console.log("Updated grid:", grid);
}

function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function getNeighbors(x, y) {
  // returns array of neighbor states [top, right, bottom, left]
  let top = grid[x][(y - 1 + rows) % rows];
  let right = grid[(x + 1) % cols][y];
  let bottom = grid[x][(y + 1) % rows];
  let left = grid[(x - 1 + cols) % cols][y];
  return [top, right, bottom, left];
}

function applyRules(currentState, neighbors) {
  // check each rule
  for (let rule of rules) {
    if (rule[0] == currentState &&
        rule[1] == neighbors[0] &&
        rule[2] == neighbors[1] &&
        rule[3] == neighbors[2] &&
        rule[4] == neighbors[3]) {
      return rule[5]; // return next state if rule matches
    }
  }
  return currentState; // no rule matched, remain in current state
}

function initializeRandomRules(n) {
    let existingRules = {}; // Object to store existing rules
  
    while (Object.keys(existingRules).length < n) {
      // Generate a potential rule
      let ruleKey = [
        floor(random(3)), // currentState
        floor(random(3)), // top
        floor(random(3)), // right
        floor(random(3)), // bottom
        floor(random(3))  // left
      ].join(","); // Create a string key by joining the conditions
  
      let nextState = floor(random(3)); // nextState
  
      // Check if the rule already exists and if it has a different nextState
      if (existingRules.hasOwnProperty(ruleKey) && existingRules[ruleKey] !== nextState) {
        // If the rule exists but with a different nextState, skip adding this rule
        continue;
      } else {
        // If the rule doesn't exist, or it exists with the same nextState, add/overwrite it
        existingRules[ruleKey] = nextState;
      }
    }
  
    // Convert the existingRules object back into the rules array format
    rules = Object.keys(existingRules).map((key) => {
      let parts = key.split(",").map(Number); // Convert string back to numbers
      parts.push(existingRules[key]); // Add the nextState
      return parts;
    });
}
  