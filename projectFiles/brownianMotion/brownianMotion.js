let particles = [];
let traceEnabled = false;
let hue = 0;
let canvasSize = 600;

class Particle {
  constructor(x, y, mass, color) {
    this.x = x;
    this.y = y;
    this.mass = mass;
    this.radius = this.mass * 2;
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
    this.color = color;
    this.strokeColor = "#FFFFFF";
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;

    // loop around the screen horizontally
    if (this.x - this.radius > width) {
      this.x = -this.radius;
    } else if (this.x + this.radius < 0) {
      this.x = width + this.radius;
    }

    // loop around the screen vertically
    if (this.y - this.radius > height) {
      this.y = -this.radius;
    } else if (this.y + this.radius < 0) {
      this.y = height + this.radius;
    }

    this.collide();
  }

  display() {
    stroke(this.strokeColor); 
    strokeWeight(1); 
    fill(this.color);
    circle(this.x, this.y, this.radius * 2);
  }

  collide() {
    particles.forEach((p) => {
      if (p !== this) {
        let d = dist(this.x, this.y, p.x, p.y);
        let collisionDistance = this.radius + p.radius;
        if (d < collisionDistance) {
          // calculate overlap plus some tolerance
          let overlap = (collisionDistance - d) / 2 + 1;

          // calculate the direction vector from the other particle to this particle
          let dx = (this.x - p.x) / d;
          let dy = (this.y - p.y) / d;

          // adjust positions to add tolerance
          this.x += dx * overlap;
          this.y += dy * overlap;
          p.x -= dx * overlap;
          p.y -= dy * overlap;

          // choose a random direction for the bounce
          let angle = random(TWO_PI);
          let speed = sqrt(this.vx * this.vx + this.vy * this.vy);
          this.vx = cos(angle) * speed;
          this.vy = sin(angle) * speed;

          // apply similar random adjustment for the other particle
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
    super(x, y, 20, "#FAD2E1");
    this.strokeColor = "#F78FA7";
  }

  move() {
    // override to make movement slower
    this.x += this.vx / 2;
    this.y += this.vy / 2;

    super.move(); // call the base move method for other logic
  }
}

class SmallParticle extends Particle {
  constructor(x, y) {
    super(x, y, 2, "#B5EAD7"); // Smaller mass, thus faster
    this.strokeColor = "#96D1C7";
  }

  move() {
    // override to increase movement speed
    this.x += this.vx * 2; 
    this.y += this.vy * 2;

    super.move(); // call the base move method for other logic
  }
}

function setup() {
  createCanvas(canvasSize, canvasSize);
  colorMode(HSB, 360, 100, 100);
  let traceButton = createButton("Trace");
  traceButton.mousePressed(toggleTrace);
  let resetButton = createButton("Reset");
  resetButton.mousePressed(resetSimulation);

  initializeParticles();
}

function initializeParticles() {
  particles = []; // clear existing particles
  let largeParticle = new LargeParticle(canvasSize / 2 , canvasSize / 2);
  particles.push(largeParticle);

  // create small particles with distance tolerance from the large particle
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
  traceEnabled = !traceEnabled;

  // clear the background once when tracing is enabled
  if (traceEnabled) {
    background(5);
  }
}

function draw() {
  if (!traceEnabled) {
    background(21);
  } else {
    // only update the hue when tracing is enabled to continuously change the color
    hue += 2;
    if (hue > 360) hue = 0; // reset hue to cycle colors
  }

  for (let particle of particles) {
    particle.move();

    if (particle instanceof LargeParticle && traceEnabled) {
      let traceColor = color(hue, 52, 100);
      fill(traceColor);
      stroke(0);
      strokeWeight(0.2);
      ellipse(particle.x, particle.y, 4, 4); // draw smaller representation for the trace
      continue;
    }

    // condition for skipping drawing small particles or rendering all particles normally
    if (!(particle instanceof LargeParticle) && traceEnabled) {
      continue;
    }

    noStroke(); // apply no stroke to other particles for normal rendering
    particle.display();
  }
}

function resetSimulation() {
  background(21);
  initializeParticles(); 
  traceEnabled = false;
}
