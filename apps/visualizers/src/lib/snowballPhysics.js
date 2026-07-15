/**
 * Compound Interest Snowball Physics and Math Logic
 */

export class Particle {
  constructor(x, y, radius, color, type = 'contribution') {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = Math.random() * 2;
    this.radius = radius;
    this.color = color;
    this.type = type; // 'contribution' or 'interest'
  }

  update(width, height, gravity = 0.2, friction = 0.98) {
    this.vy += gravity;
    this.vx *= friction;
    this.vy *= friction;

    this.x += this.vx;
    this.y += this.vy;

    // Boundary collision: bottom (jar floor is at height - 10)
    const floor = height - 10 - this.radius;
    if (this.y > floor) {
      this.y = floor;
      this.vy = -this.vy * 0.3; // soft bounce
      this.vx *= 0.8; // extra drag on floor
    }

    // Boundary collision: left wall (jar wall is at x = 10)
    const leftWall = 10 + this.radius;
    if (this.x < leftWall) {
      this.x = leftWall;
      this.vx = -this.vx * 0.3;
    }

    // Boundary collision: right wall (jar wall is at x = width - 10)
    const rightWall = width - 10 - this.radius;
    if (this.x > rightWall) {
      this.x = rightWall;
      this.vx = -this.vx * 0.3;
    }
  }
}

/**
 * Perform circle-on-circle elastic collisions with overlap resolution
 */
export function resolveCollisions(particles) {
  const len = particles.length;
  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      const p1 = particles[i];
      const p2 = particles[j];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = p1.radius + p2.radius;

      if (dist < minDist) {
        // Overlap resolution (push apart to prevent sinking)
        const overlap = minDist - dist;
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        // Push each circle back by half the overlap
        p1.x -= nx * overlap * 0.5;
        p1.y -= ny * overlap * 0.5;
        p2.x += nx * overlap * 0.5;
        p2.y += ny * overlap * 0.5;

        // Elastic collision velocity response
        const kx = p1.vx - p2.vx;
        const ky = p1.vy - p2.vy;
        const p = (2 * (nx * kx + ny * ky)) / 2; // Equal mass assumption

        p1.vx -= p * nx * 0.4;
        p1.vy -= p * ny * 0.4;
        p2.vx += p * nx * 0.4;
        p2.vy += p * ny * 0.4;
      }
    }
  }
}

/**
 * Decoupled Math: Compounding standard math formulas
 */
export function calculateCompoundingSchedules(monthlyDeposit, expectedReturn, startBalance, years) {
  const schedule = [];
  const monthlyRate = expectedReturn / 100 / 12;
  const months = years * 12;

  let balance = startBalance;
  let totalContributions = startBalance;
  let totalInterest = 0;

  schedule.push({
    year: 0,
    balance: Math.round(balance),
    contributions: Math.round(totalContributions),
    interest: Math.round(totalInterest)
  });

  for (let m = 1; m <= months; m++) {
    const interestEarned = balance * monthlyRate;
    balance += interestEarned + monthlyDeposit;
    totalContributions += monthlyDeposit;
    totalInterest += interestEarned;

    if (m % 12 === 0) {
      schedule.push({
        year: m / 12,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        interest: Math.round(totalInterest)
      });
    }
  }

  return schedule;
}
