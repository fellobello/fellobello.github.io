let particles = [];
let traceEnabled = false;
let hue = 0; // Global declaration of the hue variable
let canvasSize = 600;

class Particle {
  constructor(x, y, mass, color) {
    this.x = x;
    this.y = y;
    this.mass = mass;
    this.radius = this.mass * 2; // Size based on mass
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
    this.color = color;
    this.strokeColor = "#FFFFFF"; // Default outline color for all particles
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;

    // Loop around the screen horizontally
    if (this.x - this.radius > width) {
      this.x = -this.radius;
    } else if (this.x + this.radius < 0) {
      this.x = width + this.radius;
    }

    // Loop around the screen vertically
    if (this.y - this.radius > height) {
      this.y = -this.radius;
    } else if (this.y + this.radius < 0) {
      this.y = height + this.radius;
    }

    this.collide();
  }

  display() {
    stroke(this.strokeColor); // Outline color
    strokeWeight(1); // Outline thickness
    fill(this.color);
    circle(this.x, this.y, this.radius * 2); // Diameter = radius * 2
  }

  collide() {
    particles.forEach((p) => {
      if (p !== this) {
        let d = dist(this.x, this.y, p.x, p.y);
        let collisionDistance = this.radius + p.radius;
        if (d < collisionDistance) {
          // Calculate overlap plus some tolerance
          let overlap = (collisionDistance - d) / 2 + 1; // The '+ 1' adds a bit of separation tolerance

          // Calculate the direction vector from the other particle to this particle
          let dx = (this.x - p.x) / d;
          let dy = (this.y - p.y) / d;

          // Adjust positions to add tolerance
          this.x += dx * overlap;
          this.y += dy * overlap;
          p.x -= dx * overlap;
          p.y -= dy * overlap;

          // Choose a random direction for the bounce
          let angle = random(TWO_PI);
          let speed = sqrt(this.vx * this.vx + this.vy * this.vy);
          this.vx = cos(angle) * speed;
          this.vy = sin(angle) * speed;

          // Apply similar random adjustment for the other particle
          angle = random(TWO_PI);
          speed = sqrt(p.vx * p.vx + p.vy * p.vy);
          p.vx = cos(angle) * speed;
          p.vy = sin(angle) * speed;
        }
      }
    });
  }
}

class LargeParticle extends Particle {
  constructor(x, y) {
    super(x, y, 20, "#FAD2E1"); // Assuming a larger mass is indicated by the constructor's mass parameter
    this.strokeColor = "#F78FA7";
  }

  move() {
    // Override to make movement slower
    this.x += this.vx / 2; // Slowing down the movement
    this.y += this.vy / 2;

    super.move(); // Call the base move method for other logic
  }
}

class SmallParticle extends Particle {
  constructor(x, y) {
    super(x, y, 2, "#B5EAD7"); // Smaller mass, thus faster
    this.strokeColor = "#96D1C7";
  }

  move() {
    // Override to increase movement speed
    this.x += this.vx * 2; // Increasing the movement speed
    this.y += this.vy * 2;

    super.move(); // Call the base move method for other logic
  }
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  colorMode(HSB, 360, 100, 100); // Use HSB color mode for smooth color transitions
  let traceButton = createButton("Trace");
  traceButton.mousePressed(toggleTrace);
  let resetButton = createButton("Reset");
  resetButton.mousePressed(resetSimulation);

  initializeParticles();
}

function initializeParticles() {
  particles = []; // Clear existing particles
  let largeParticle = new LargeParticle(canvasSize / 2 , canvasSize / 2);
  particles.push(largeParticle);

  // Create small particles with distance tolerance from the large particle
  for (let i = 0; i < 150; i++) {
    let validPosition = false;
    let x, y;
    while (!validPosition) {
      x = random(width);
      y = random(height);
      let d = dist(x, y, largeParticle.x, largeParticle.y);
      if (d > largeParticle.radius + 50) {
        // 50 is the tolerance
        validPosition = true;
      }
    }
    particles.push(new SmallParticle(x, y));
  }
}

function toggleTrace() {
  traceEnabled = !traceEnabled; // Toggle trace state

  // Clear the background once when tracing is enabled
  if (traceEnabled) {
    background(5); // Clear the background to remove previous drawings
  }
}

function draw() {
  if (!traceEnabled) {
    background(21);
  } else {
    // Only update the hue when tracing is enabled to continuously change the color
    hue += 2; // Increment hue for color transition. Adjust the increment for speed.
    if (hue > 360) hue = 0; // Reset hue to cycle colors
  }

  for (let particle of particles) {
    particle.move();

    if (particle instanceof LargeParticle && traceEnabled) {
      let traceColor = color(hue, 52, 100); // Use the updated hue for the trace color
      fill(traceColor);
      stroke(0); // Small black border for better visibility
      strokeWeight(0.2);
      ellipse(particle.x, particle.y, 4, 4); // Draw smaller representation for the trace
      continue;
    }

    // Condition for skipping drawing small particles or rendering all particles normally
    if (!(particle instanceof LargeParticle) && traceEnabled) {
      continue;
    }

    noStroke(); // Apply no stroke to other particles for normal rendering
    particle.display();
  }
}

function resetSimulation() {
  background(21); // Clear the canvas
  initializeParticles(); // Re-initialize particles
  traceEnabled = false; // Disable tracing after reset
}
