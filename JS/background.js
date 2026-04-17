// Advanced 3D Constellation Particles
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');

let particlesArray;
let mouse = { x: null, y: null };

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle Class 3D
class Particle3D {
  constructor(x, y, z, size) {
    this.origX = x;
    this.origY = y;
    this.x = x;
    this.y = y;
    this.z = z;
    this.baseSize = size;

    // velocity
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // Bounds wrap
    if (this.x > canvas.width) this.x = 0;
    else if (this.x < 0) this.x = canvas.width;
    if (this.y > canvas.height) this.y = 0;
    else if (this.y < 0) this.y = canvas.height;

    // Attraction to mouse
    if (mouse.x != null) {
      let dx = mouse.x - this.x;
      let dy = mouse.y - this.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 250) {
        let force = (250 - distance) / 250;
        this.x += (dx / distance) * force * 1.5;
        this.y += (dy / distance) * force * 1.5;
        // slightly jump forward in Z
        this.z += (1 - this.z) * 0.1;
      } else {
        this.z += (this.baseSize - this.z) * 0.05; // return to normal z
      }
    }
  }

  draw() {
    // Fake 3D Projection
    let fov = 300;
    let scale = fov / (fov + this.z * 100);
    // Move origin to center for 3D rotation feel
    let px = (this.x - canvas.width / 2) * scale + canvas.width / 2;
    let py = (this.y - canvas.height / 2) * scale + canvas.height / 2;

    // Slight parallax with mouse
    if (mouse.x) {
      px += (canvas.width / 2 - mouse.x) * (this.z * 0.02);
      py += (canvas.height / 2 - mouse.y) * (this.z * 0.02);
    }

    let projectedSize = this.baseSize * scale;

    ctx.beginPath();
    ctx.arc(px, py, projectedSize, 0, Math.PI * 2, false);
    ctx.fillStyle = `rgba(162, 82, 255, ${scale})`;
    ctx.fill();

    return { px, py, scale };
  }
}

function init() {
  particlesArray = [];
  const numberOfParticles = (canvas.width * canvas.height) / 10000;

  for (let i = 0; i < numberOfParticles; i++) {
    const size = (Math.random() * 2) + 0.5;
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const z = Math.random() * 3 + 1; // Z depth

    particlesArray.push(new Particle3D(x, y, z, size));
  }
}

function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  let projectedPoints = [];

  for (let i = 0; i < particlesArray.length; i++) {
    particlesArray[i].update();
    projectedPoints.push(particlesArray[i].draw());
  }

  // Draw connecting lines
  for (let a = 0; a < particlesArray.length; a++) {
    for (let b = a; b < particlesArray.length; b++) {
      let pA = projectedPoints[a];
      let pB = projectedPoints[b];
      let dx = pA.px - pB.px;
      let dy = pA.py - pB.py;
      let distance = Math.sqrt(dx * dx + dy * dy);

      let maxDist = 100;
      if (distance < maxDist) {
        let opacity = 1 - (distance / maxDist);
        // Dim line further away
        opacity *= ((pA.scale + pB.scale) / 2);

        ctx.strokeStyle = `rgba(162, 82, 255, ${opacity * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pA.px, pA.py);
        ctx.lineTo(pB.px, pB.py);
        ctx.stroke();
      }
    }
  }
}

init();
animate();
