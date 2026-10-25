/**
 * Diwali Celebration - Wheel Engine
 * High-precision canvas renderer, smooth physics, authentic flapper deflection,
 * prominent large reward display, and guaranteed promotional target landing.
 */

const DEFAULT_PRIZES = [
  {
    id: 'movie_ticket',
    label: 'Ticket for Movie',
    line1: 'FREE MOVIE',
    line2: 'TICKET',
    icon: '🎟️',
    color1: '#8B0000', // Deep Royal Crimson
    color2: '#C62828',
    accent: '#FFD700',
    textColor: '#FFF9C4',
    isTarget: true
  },
  {
    id: 'popcorn',
    label: 'Free Popcorn',
    line1: 'FREE',
    line2: 'POPCORN',
    icon: '🍿',
    color1: '#0D47A1', // Deep Navy
    color2: '#1976D2',
    accent: '#FFF176',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'bay_zero',
    label: 'Bay 0 Access',
    line1: 'BAY 0',
    line2: 'ACCESS',
    icon: '🏛️',
    color1: '#1B5E20', // Emerald Green
    color2: '#2E7D32',
    accent: '#C8E6C9',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'coupon_200',
    label: '₹200 Stall Coupon',
    line1: '₹200 STALL',
    line2: 'COUPON',
    icon: '🏷️',
    color1: '#4A148C', // Deep Purple
    color2: '#7B1FA2',
    accent: '#E1BEE7',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'sweets_box',
    label: 'Diwali Sweets Box',
    line1: 'DIWALI',
    line2: 'SWEETS',
    icon: '🪔',
    color1: '#E65100', // Deep Saffron / Amber
    color2: '#FB8C00',
    accent: '#FFE082',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'sparklers',
    label: 'Sparklers Pack',
    line1: 'SPARKLERS',
    line2: 'PACK',
    icon: '🎆',
    color1: '#880E4F', // Rich Magenta
    color2: '#C2185B',
    accent: '#F8BBD0',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'fest_merch',
    label: 'Fest Exclusive T-Shirt',
    line1: 'FEST MERCH',
    line2: 'T-SHIRT',
    icon: '👕',
    color1: '#004D40', // Deep Teal
    color2: '#00897B',
    accent: '#B2DFDB',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'chilled_beverage',
    label: 'Chilled Beverage',
    line1: 'CHILLED',
    line2: 'BEVERAGE',
    icon: '🥤',
    color1: '#BF360C', // Rust Amber
    color2: '#E64A19',
    accent: '#FFCCBC',
    textColor: '#FFFFFF',
    isTarget: false
  }
];

class DiwaliWheel {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.prizes = options.prizes || DEFAULT_PRIZES;
    this.numSlices = this.prizes.length;
    this.sliceAngle = (2 * Math.PI) / this.numSlices;

    // Angle state (in radians)
    this.currentAngle = 0;
    this.isSpinning = false;
    this.targetPrizeId = options.targetPrizeId || 'movie_ticket'; // Always Ticket for Movie!

    // Pointer flapper animation state
    this.flapperAngle = 0;
    this.lastPegIndex = -1;

    // LED marquee bulbs
    this.numLeds = 24;
    this.ledState = 0;
    this.lastLedTick = 0;

    // Callbacks
    this.onSpinStart = options.onSpinStart || (() => {});
    this.onSpinEnd = options.onSpinEnd || (() => {});
    this.onTick = options.onTick || (() => {});

    // High DPI scaling
    this.setupDPI();
    window.addEventListener('resize', () => {
      this.setupDPI();
      this.draw();
    });

    // Start ambient animation
    this.ambientLoop();
  }

  setupDPI() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(rect.width, rect.height) || 520;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    this.ctx.scale(dpr, dpr);

    this.displaySize = size;
    this.centerX = size / 2;
    this.centerY = size / 2;
    this.wheelRadius = size * 0.44;
  }

  ambientLoop(timestamp = 0) {
    if (!this.isSpinning) {
      if (timestamp - this.lastLedTick > 280) {
        this.ledState = (this.ledState + 1) % 3;
        this.lastLedTick = timestamp;
        this.draw();
      }
    }
    requestAnimationFrame((t) => this.ambientLoop(t));
  }

  setLandedOnPrize(prizeId = 'movie_ticket') {
    let targetIndex = this.prizes.findIndex(p => p.id === prizeId);
    if (targetIndex === -1) targetIndex = 0;
    const pointerAngle = 1.5 * Math.PI;
    const sectorCenter = (targetIndex + 0.5) * this.sliceAngle;
    this.currentAngle = pointerAngle - sectorCenter;
    this.draw();
  }

  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.onSpinStart();

    // 1. Determine target slice index
    let targetIndex = this.prizes.findIndex(p => p.id === this.targetPrizeId);
    if (targetIndex === -1) targetIndex = 0;

    const twoPi = Math.PI * 2;
    const pointerAngle = 1.5 * Math.PI;
    const sectorCenter = (targetIndex + 0.5) * this.sliceAngle;

    // Safe random jitter within sector bounds (-10 deg to +10 deg)
    const jitter = (Math.random() - 0.5) * (this.sliceAngle * 0.45);

    let desiredFinalMod = (pointerAngle - sectorCenter + jitter) % twoPi;
    if (desiredFinalMod < 0) desiredFinalMod += twoPi;

    let currentMod = this.currentAngle % twoPi;
    if (currentMod < 0) currentMod += twoPi;

    let delta = desiredFinalMod - currentMod;
    if (delta <= 0) delta += twoPi;

    // Total rotations: 7 to 9 full spins
    const fullSpins = (7 + Math.floor(Math.random() * 2)) * twoPi;
    const totalRotation = fullSpins + delta;

    const startAngle = this.currentAngle;
    const endAngle = startAngle + totalRotation;
    const duration = 5600 + Math.random() * 500;
    const startTime = performance.now();

    // Quintic Ease-Out curve for dramatic deceleration
    const easeOutCustom = (t) => 1 - Math.pow(1 - t, 4.2);
    let lastAngle = startAngle;

    const animateSpin = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCustom(progress);

      this.currentAngle = startAngle + totalRotation * easedProgress;

      const angleDelta = this.currentAngle - lastAngle;
      lastAngle = this.currentAngle;

      this.checkPegTicks(angleDelta);
      this.flapperAngle *= 0.82;
      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        this.currentAngle = endAngle;
        this.isSpinning = false;
        this.flapperAngle = 0;
        this.draw();

        const wonPrize = this.prizes[targetIndex];
        this.onSpinEnd(wonPrize);
      }
    };

    requestAnimationFrame(animateSpin);
  }

  checkPegTicks(velocity) {
    const effectiveAngle = (1.5 * Math.PI - this.currentAngle) % (Math.PI * 2);
    const normalized = (effectiveAngle < 0 ? effectiveAngle + Math.PI * 2 : effectiveAngle);
    const pegPosition = normalized / this.sliceAngle;
    const currentPeg = Math.floor(pegPosition);

    if (currentPeg !== this.lastPegIndex) {
      this.lastPegIndex = currentPeg;
      const intensity = Math.min(velocity * 40, 1.2);
      this.flapperAngle = -0.32 * Math.max(intensity, 0.4);
      this.onTick(intensity);
    }
  }

  draw() {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;
    const R = this.wheelRadius;

    ctx.clearRect(0, 0, this.displaySize, this.displaySize);

    // 1. Outer Glowing Aura
    ctx.save();
    const auraGradient = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.15);
    auraGradient.addColorStop(0, 'rgba(255, 193, 7, 0.32)');
    auraGradient.addColorStop(0.5, 'rgba(255, 111, 0, 0.18)');
    auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Outer Decorative Brass Rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R + 18, 0, Math.PI * 2);
    const rimGrad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    rimGrad.addColorStop(0, '#FFE082');
    rimGrad.addColorStop(0.25, '#FFB300');
    rimGrad.addColorStop(0.5, '#795548');
    rimGrad.addColorStop(0.75, '#FFA000');
    rimGrad.addColorStop(1, '#FFD54F');
    ctx.fillStyle = rimGrad;
    ctx.shadowBlur = 14;
    ctx.shadowColor = 'rgba(255, 179, 0, 0.55)';
    ctx.fill();
    ctx.restore();

    // 3. Marquee LED Bulbs around rim
    this.drawLeds(cx, cy, R + 9);

    // 4. Draw Wheel Slices
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.currentAngle);

    for (let i = 0; i < this.numSlices; i++) {
      const prize = this.prizes[i];
      const startAngle = i * this.sliceAngle;
      const endAngle = startAngle + this.sliceAngle;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, startAngle, endAngle);
      ctx.closePath();

      const sliceGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, R);
      sliceGrad.addColorStop(0, prize.color2);
      sliceGrad.addColorStop(0.85, prize.color1);
      sliceGrad.addColorStop(1, '#1A0000');
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Golden inner border between slices
      ctx.strokeStyle = 'rgba(255, 215, 0, 0.75)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Highlight target prize (Ticket for Movie) with gold outer shimmer
      if (prize.isTarget) {
        ctx.save();
        ctx.strokeStyle = '#FFE082';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, R - 5, startAngle + 0.03, endAngle - 0.03);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Big, Prominent Slice Content
      this.drawSliceContent(prize, startAngle + this.sliceAngle / 2, R);

      // Draw metallic pegs at slice boundaries
      this.drawPeg(startAngle, R - 2);
    }

    ctx.restore();

    // 5. Draw Center Golden Hub & Diya (Sleek & Compact)
    this.drawCenterHub(cx, cy);

    // 6. Draw Top Stopper / Flapper Pointer
    this.drawPointer(cx, cy - R + 2);
  }

  drawLeds(cx, cy, radius) {
    const ctx = this.ctx;
    const bulbCount = this.numLeds;

    for (let i = 0; i < bulbCount; i++) {
      const angle = (i / bulbCount) * Math.PI * 2;
      const bx = cx + Math.cos(angle) * radius;
      const by = cy + Math.sin(angle) * radius;

      const stateIndex = (i + this.ledState) % 3;
      let bulbColor = '#FFECB3';
      let glowColor = 'rgba(255, 235, 59, 0.8)';

      if (stateIndex === 0) {
        bulbColor = '#FFF59D'; // Golden warm
        glowColor = 'rgba(255, 215, 0, 0.9)';
      } else if (stateIndex === 1) {
        bulbColor = '#FF8A80'; // Festive red
        glowColor = 'rgba(255, 23, 68, 0.8)';
      } else {
        bulbColor = '#FFFFFF'; // Pure diamond spark
        glowColor = 'rgba(255, 255, 255, 0.9)';
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = bulbColor;
      ctx.shadowBlur = 8;
      ctx.shadowColor = glowColor;
      ctx.fill();

      // Tiny shiny highlight
      ctx.beginPath();
      ctx.arc(bx - 1.2, by - 1.2, 1.4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.restore();
    }
  }

  drawSliceContent(prize, midAngle, R) {
    const ctx = this.ctx;
    ctx.save();
    ctx.rotate(midAngle);

    const scale = Math.max(0.85, Math.min(R / 220, 1.3));

    // 1. BIG EYE-CATCHING ICON (38px - 44px)
    const iconX = R * 0.77;
    const iconSize = Math.round(38 * scale);

    // Circular background badge behind icon to make it pop vividly
    ctx.save();
    ctx.beginPath();
    ctx.arc(iconX, 0, 24 * scale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fill();
    ctx.strokeStyle = prize.isTarget ? '#FFD700' : 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = prize.isTarget ? 2 : 1;
    ctx.stroke();
    ctx.restore();

    ctx.font = `${iconSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(prize.icon, iconX, 0);

    // 2. LARGE, PROMINENT, BOLD REWARD TEXT
    const textX = R * 0.46;
    const lineSpacing = 10 * scale;
    const maxTextWidth = R * 0.38;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Helper to draw bold text with thick dark contrast outline
    const drawStrokedText = (text, x, y, font, fillColor, strokeColor = '#000000', lineWidth = 3.8) => {
      ctx.font = font;
      ctx.lineJoin = 'round';
      ctx.miterLimit = 2;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth * scale;
      ctx.strokeText(text, x, y);
      ctx.fillStyle = fillColor;
      ctx.fillText(text, x, y);
    };

    // Calculate font sizes - MUCH BIGGER
    let font1Size = Math.round(15.5 * scale);
    ctx.font = `900 ${font1Size}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    let w1 = ctx.measureText(prize.line1).width;
    if (w1 > maxTextWidth) {
      font1Size = Math.max(11, Math.round(font1Size * (maxTextWidth / w1)));
    }
    const font1 = `900 ${font1Size}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

    let font2Size = Math.round(14 * scale);
    ctx.font = `900 ${font2Size}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    let w2 = ctx.measureText(prize.line2).width;
    if (w2 > maxTextWidth) {
      font2Size = Math.max(10, Math.round(font2Size * (maxTextWidth / w2)));
    }
    const font2 = `900 ${font2Size}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

    // Colors: Vibrant Gold / Bright White
    const color1 = prize.isTarget ? '#FFEB3B' : prize.textColor;
    const color2 = prize.isTarget ? '#FFFFFF' : (prize.accent || '#FFE082');

    drawStrokedText(prize.line1, textX, -lineSpacing, font1, color1);
    drawStrokedText(prize.line2, textX, lineSpacing, font2, color2);

    // Winner badge on Movie Ticket slice
    if (prize.isTarget) {
      ctx.save();
      ctx.font = `bold ${9.5 * scale}px sans-serif`;
      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText('★ VIP PRIZE ★', R * 0.24, 0);
      ctx.restore();
    }

    ctx.restore();
  }

  drawPeg(angle, radius) {
    const ctx = this.ctx;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD54F';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px - 1, py - 1, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFDE7';
    ctx.fill();
    ctx.restore();
  }

  drawCenterHub(cx, cy) {
    const ctx = this.ctx;
    const hubRadius = this.wheelRadius * 0.165;

    ctx.save();
    // Outer golden bevel
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius + 4.5, 0, Math.PI * 2);
    const grad1 = ctx.createLinearGradient(cx - hubRadius, cy - hubRadius, cx + hubRadius, cy + hubRadius);
    grad1.addColorStop(0, '#FFE082');
    grad1.addColorStop(0.5, '#B78103');
    grad1.addColorStop(1, '#FFD54F');
    ctx.fillStyle = grad1;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.fill();

    // Inner rich maroon disc
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubRadius);
    innerGrad.addColorStop(0, '#5D101D');
    innerGrad.addColorStop(0.85, '#2D050B');
    innerGrad.addColorStop(1, '#1A0004');
    ctx.fillStyle = innerGrad;
    ctx.fill();

    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '20px sans-serif';
    ctx.fillText('🪔', cx, cy - 2);

    ctx.font = 'bold 7.5px "Inter", sans-serif';
    ctx.fillStyle = '#FFD54F';
    ctx.fillText('NITT', cx, cy + 13);
    ctx.restore();
  }

  drawPointer(tipX, tipY) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(this.flapperAngle);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.beginPath();
    ctx.moveTo(0, 36);
    ctx.lineTo(-14, 0);
    ctx.lineTo(-10, -18);
    ctx.lineTo(10, -18);
    ctx.lineTo(14, 0);
    ctx.closePath();

    const pointerGrad = ctx.createLinearGradient(-14, -18, 14, 36);
    pointerGrad.addColorStop(0, '#FFF9C4');
    pointerGrad.addColorStop(0.3, '#FFD54F');
    pointerGrad.addColorStop(0.7, '#FF8F00');
    pointerGrad.addColorStop(1, '#FF6F00');
    ctx.fillStyle = pointerGrad;
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -5, 6, 0, Math.PI * 2);
    const rubyGrad = ctx.createRadialGradient(-2, -7, 1, 0, -5, 6);
    rubyGrad.addColorStop(0, '#FF8A80');
    rubyGrad.addColorStop(0.5, '#D50000');
    rubyGrad.addColorStop(1, '#5F0000');
    ctx.fillStyle = rubyGrad;
    ctx.fill();

    ctx.restore();
  }

  setTargetPrize(prizeId) {
    this.targetPrizeId = prizeId;
  }
}
