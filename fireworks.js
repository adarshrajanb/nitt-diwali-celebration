/**
 * Diwali Fireworks & Golden Confetti Engine
 * Renders celebratory fireworks, sparklers, and confetti across the canvas.
 */
class FireworksEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.rockets = [];
    this.confetti = [];
    this.isRunning = false;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  startCelebration(duration = 7000) {
    this.isRunning = true;
    this.resize();

    // Launch initial salvo of rockets
    this.launchBurstSalvo(8);

    // Continuous celebration
    const interval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      this.launchRandomRocket();
      this.addConfettiBurst();
    }, 400);

    // Stop launching new after duration
    setTimeout(() => {
      clearInterval(interval);
      setTimeout(() => {
        this.isRunning = false;
        this.clear();
      }, 3000);
    }, duration);

    this.animate();
  }

  launchBurstSalvo(count = 6) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const x = this.canvas.width * (0.15 + Math.random() * 0.7);
        const y = this.canvas.height * (0.2 + Math.random() * 0.35);
        this.explodeAt(x, y);
      }, i * 220);
    }
  }

  launchRandomRocket() {
    const x = this.canvas.width * (0.2 + Math.random() * 0.6);
    const targetY = this.canvas.height * (0.15 + Math.random() * 0.35);
    this.explodeAt(x, targetY);
  }

  explodeAt(x, y) {
    const festiveColors = [
      '#FFD700', // Gold
      '#FF9933', // Deep Saffron
      '#FF3366', // Festive Pink / Red
      '#00FFCC', // Cyan Spark
      '#9933FF', // Royal Purple
      '#FFFFFF', // White Flash
      '#FF6600', // Marigold Orange
      '#00E676'  // Emerald Spark
    ];

    const color1 = festiveColors[Math.floor(Math.random() * festiveColors.length)];
    const color2 = festiveColors[Math.floor(Math.random() * festiveColors.length)];
    const particleCount = 70;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i + (Math.random() * 0.2);
      const speed = 2.5 + Math.random() * 6;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: Math.random() > 0.5 ? color1 : color2,
        decay: 0.012 + Math.random() * 0.018,
        gravity: 0.1,
        size: 2 + Math.random() * 3,
        sparkle: Math.random() > 0.4
      });
    }
  }

  addConfettiBurst() {
    const colors = ['#FFD700', '#FF5722', '#E91E63', '#00BCD4', '#8BC34A', '#FFC107'];
    for (let i = 0; i < 25; i++) {
      this.confetti.push({
        x: Math.random() * this.canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: 7 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1
      });
    }
  }

  clear() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.particles = [];
    this.confetti = [];
  }

  animate() {
    if (!this.isRunning && this.particles.length === 0 && this.confetti.length === 0) {
      this.clear();
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw & update firework particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // Draw & update confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.rotation += c.rotationSpeed;

      if (c.y > this.canvas.height) {
        this.confetti.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(c.x, c.y);
      this.ctx.rotate((c.rotation * Math.PI) / 180);
      this.ctx.fillStyle = c.color;
      this.ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}
