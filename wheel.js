/**
 * Diwali Celebration - Wheel Engine
 * High-precision canvas renderer, smooth physics, authentic flapper deflection,
 * prominent large reward display, and guaranteed promotional target landing.
 * Institutional NIT Trichy Academic Navy & Festive Gold Design System.
 */

const DEFAULT_PRIZES = [
  {
    id: 'movie_ticket',
    label: 'Ticket for Movie',
    line1: 'CAMPUS MOVIE',
    line2: 'TICKET',
    icon: '🎟️',
    color1: '#1E3A8A', // Deep Royal Academic Navy
    color2: '#2563EB',
    accent: '#FDE68A',
    textColor: '#FFFFFF',
    isTarget: true
  },
  {
    id: 'popcorn',
    label: 'Free Popcorn',
    line1: 'FREE',
    line2: 'POPCORN',
    icon: '🍿',
    color1: '#0F172A', // Slate Midnight
    color2: '#1E293B',
    accent: '#CBD5E1',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'bay_zero',
    label: 'Bay 0 Access',
    line1: 'BAY 0',
    line2: 'ACCESS',
    icon: '🏛️',
    color1: '#1E1B4B', // Deep Royal Indigo
    color2: '#312E81',
    accent: '#E0E7FF',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'coupon_200',
    label: '₹200 Stall Coupon',
    line1: '₹200 STALL',
    line2: 'COUPON',
    icon: '🏷️',
    color1: '#0B192C', // Deep Twilight Slate
    color2: '#1E3E62',
    accent: '#FDE68A',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'sweets_box',
    label: 'Diwali Sweets Box',
    line1: 'DIWALI',
    line2: 'SWEETS',
    icon: '🪔',
    color1: '#78350F', // Rich Warm Amber
    color2: '#92400E',
    accent: '#FEF3C7',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'sparklers',
    label: 'Sparklers Pack',
    line1: 'SPARKLERS',
    line2: 'PACK',
    icon: '🎆',
    color1: '#0F172A', // Slate Midnight
    color2: '#1E293B',
    accent: '#CBD5E1',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'fest_merch',
    label: 'Fest Exclusive T-Shirt',
    line1: 'FEST MERCH',
    line2: 'T-SHIRT',
    icon: '👕',
    color1: '#172554', // Deep Ocean Navy
    color2: '#1E40AF',
    accent: '#FDE68A',
    textColor: '#FFFFFF',
    isTarget: false
  },
  {
    id: 'chilled_beverage',
    label: 'Chilled Beverage',
    line1: 'CHILLED',
    line2: 'BEVERAGE',
    icon: '🥤',
    color1: '#0B192C', // Deep Twilight Slate
    color2: '#1E3E62',
    accent: '#BAE6FD',
    textColor: '#FFFFFF',
    isTarget: false
  }
];

class DiwaliWheel {
  static getDefaultPrizes() {
    return JSON.parse(JSON.stringify(DEFAULT_PRIZES));
  }

  static loadPrizes() {
    try {
      const raw = localStorage.getItem('nitt_wheel_prizes');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length >= 2) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not parse stored wheel prizes:', err);
    }
    return DiwaliWheel.getDefaultPrizes();
  }

  static savePrizes(prizes) {
    try {
      localStorage.setItem('nitt_wheel_prizes', JSON.stringify(prizes));
    } catch (err) {
      console.error('Failed to save prizes to localStorage:', err);
    }
  }

  static loadTargetPrizeId() {
    return localStorage.getItem('nitt_target_prize_id') || 'movie_ticket';
  }

  static saveTargetPrizeId(targetId) {
    localStorage.setItem('nitt_target_prize_id', targetId);
  }

  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.targetPrizeId = options.targetPrizeId !== undefined ? options.targetPrizeId : DiwaliWheel.loadTargetPrizeId();
    this.prizes = options.prizes ? options.prizes : DiwaliWheel.loadPrizes();
    this.updateTargetFlags();

    this.numSlices = this.prizes.length;
    this.sliceAngle = (2 * Math.PI) / this.numSlices;

    // Angle state (in radians)
    this.currentAngle = 0;
    this.isSpinning = false;

    // Pointer flapper animation state
    this.flapperAngle = 0;
    this.lastPegIndex = -1;

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

    // Initial render
    this.draw();
  }

  setupDPI() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const size = Math.min(rect.width, rect.height) || 500;

    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    this.ctx.scale(dpr, dpr);

    this.displaySize = size;
    this.centerX = size / 2;
    this.centerY = size / 2;
    this.wheelRadius = size * 0.44;
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
    let targetIndex;
    if (this.targetPrizeId === 'random' || !this.targetPrizeId) {
      targetIndex = Math.floor(Math.random() * this.prizes.length);
    } else {
      targetIndex = this.prizes.findIndex(p => p.id === this.targetPrizeId);
      if (targetIndex === -1) targetIndex = 0;
    }

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

    // 1. Outer Subtle Ambient Backlight (Executive Navy & Gold Aura)
    ctx.save();
    const auraGradient = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.14);
    auraGradient.addColorStop(0, 'rgba(29, 78, 216, 0.22)');
    auraGradient.addColorStop(0.6, 'rgba(217, 119, 6, 0.12)');
    auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. High-Precision Brushed Gold & Slate Outer Bezel
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R + 18, 0, Math.PI * 2);
    const rimGrad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
    rimGrad.addColorStop(0, '#FDE68A');
    rimGrad.addColorStop(0.2, '#D97706');
    rimGrad.addColorStop(0.5, '#1E293B'); // Slate Chamfer
    rimGrad.addColorStop(0.8, '#D97706');
    rimGrad.addColorStop(1, '#F59E0B');
    ctx.fillStyle = rimGrad;
    ctx.shadowBlur = 16;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.fill();
    ctx.restore();

    // 3. Precision Machined Studs around the Bezel (Replacing tacky blinking LEDs)
    this.drawBezelStuds(cx, cy, R + 9);

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
      sliceGrad.addColorStop(0.82, prize.color1);
      sliceGrad.addColorStop(1, '#060B18');
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Sleek subtle border between slices
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.45)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Highlight target prize with precision inner gold track
      if (prize.isTarget) {
        ctx.save();
        ctx.strokeStyle = '#FDE68A';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, R - 4, startAngle + 0.03, endAngle - 0.03);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Slice Content (Clean, High-Contrast Typography)
      this.drawSliceContent(prize, startAngle + this.sliceAngle / 2, R);

      // Draw metallic pegs at slice boundaries
      this.drawPeg(startAngle, R - 2);
    }

    ctx.restore();

    // 5. Draw Center Institutional Seal Medallion
    this.drawCenterHub(cx, cy);

    // 6. Draw Top Precision Flapper Pointer
    this.drawPointer(cx, cy - R + 2);
  }

  drawBezelStuds(cx, cy, radius) {
    const ctx = this.ctx;
    const studCount = 24;

    for (let i = 0; i < studCount; i++) {
      const angle = (i / studCount) * Math.PI * 2;
      const bx = cx + Math.cos(angle) * radius;
      const by = cy + Math.sin(angle) * radius;

      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, 3.8, 0, Math.PI * 2);
      
      const studGrad = ctx.createLinearGradient(bx - 3, by - 3, bx + 3, by + 3);
      studGrad.addColorStop(0, '#FEF3C7');
      studGrad.addColorStop(0.5, '#F59E0B');
      studGrad.addColorStop(1, '#78350F');
      
      ctx.fillStyle = studGrad;
      ctx.shadowBlur = 3;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.fill();

      // Micro specular highlight
      ctx.beginPath();
      ctx.arc(bx - 1, by - 1, 1.2, 0, Math.PI * 2);
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

    // 1. Refined Circular Icon Badge
    const iconX = R * 0.77;
    const iconSize = Math.round(36 * scale);

    ctx.save();
    ctx.beginPath();
    ctx.arc(iconX, 0, 23 * scale, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(11, 19, 43, 0.65)';
    ctx.fill();
    ctx.strokeStyle = prize.isTarget ? '#FDE68A' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = prize.isTarget ? 1.8 : 1;
    ctx.stroke();
    ctx.restore();

    ctx.font = `${iconSize}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(prize.icon, iconX, 0);

    // 2. High-Contrast, Crisp Typography (No thick cartoon outline)
    const textX = R * 0.46;
    const lineSpacing = 10 * scale;
    const maxTextWidth = R * 0.38;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const drawCleanText = (text, x, y, font, fillColor) => {
      ctx.font = font;
      // Soft drop shadow for legibility on dark slices
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 4 * scale;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1.5 * scale;
      ctx.fillStyle = fillColor;
      ctx.fillText(text, x, y);
    };

    // Calculate font sizes
    let font1Size = Math.round(15 * scale);
    ctx.font = `800 ${font1Size}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    let w1 = ctx.measureText(prize.line1).width;
    if (w1 > maxTextWidth) {
      font1Size = Math.max(11, Math.round(font1Size * (maxTextWidth / w1)));
    }
    const font1 = `800 ${font1Size}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

    let font2Size = Math.round(13.5 * scale);
    ctx.font = `800 ${font2Size}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    let w2 = ctx.measureText(prize.line2).width;
    if (w2 > maxTextWidth) {
      font2Size = Math.max(10, Math.round(font2Size * (maxTextWidth / w2)));
    }
    const font2 = `800 ${font2Size}px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;

    const color1 = prize.isTarget ? '#FDE68A' : (prize.textColor || '#FFFFFF');
    const color2 = prize.isTarget ? '#FFFFFF' : (prize.accent || '#E2E8F0');

    drawCleanText(prize.line1, textX, -lineSpacing, font1, color1);
    drawCleanText(prize.line2, textX, lineSpacing, font2, color2);

    ctx.restore();
  }

  drawPeg(angle, radius) {
    const ctx = this.ctx;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;

    ctx.save();
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE68A';
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px - 1, py - 1, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.restore();
  }

  drawCenterHub(cx, cy) {
    const ctx = this.ctx;
    const hubRadius = this.wheelRadius * 0.17;

    ctx.save();
    // Outer golden bezel ring
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius + 4, 0, Math.PI * 2);
    const grad1 = ctx.createLinearGradient(cx - hubRadius, cy - hubRadius, cx + hubRadius, cy + hubRadius);
    grad1.addColorStop(0, '#FDE68A');
    grad1.addColorStop(0.5, '#B45309');
    grad1.addColorStop(1, '#D97706');
    ctx.fillStyle = grad1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.fill();

    // Inner deep academic navy disc
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, Math.PI * 2);
    const innerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubRadius);
    innerGrad.addColorStop(0, '#1E3A8A');
    innerGrad.addColorStop(0.7, '#0F1A3A');
    innerGrad.addColorStop(1, '#060B18');
    ctx.fillStyle = innerGrad;
    ctx.fill();

    ctx.strokeStyle = 'rgba(253, 230, 138, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Stylized Diya / Star Emblem
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '20px sans-serif';
    ctx.fillText('🪔', cx, cy - 2);

    // Clean institutional caption
    ctx.font = 'bold 7.5px "Inter", sans-serif';
    ctx.fillStyle = '#FDE68A';
    ctx.letterSpacing = '1px';
    ctx.fillText('NITT CC', cx, cy + 13);
    ctx.restore();
  }

  drawPointer(tipX, tipY) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(this.flapperAngle);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 3;

    // Sleek precision titanium / gold needle
    ctx.beginPath();
    ctx.moveTo(0, 34);
    ctx.lineTo(-13, 0);
    ctx.lineTo(-9, -16);
    ctx.lineTo(9, -16);
    ctx.lineTo(13, 0);
    ctx.closePath();

    const pointerGrad = ctx.createLinearGradient(-13, -16, 13, 34);
    pointerGrad.addColorStop(0, '#FFFFFF');
    pointerGrad.addColorStop(0.3, '#FDE68A');
    pointerGrad.addColorStop(0.7, '#D97706');
    pointerGrad.addColorStop(1, '#B45309');
    ctx.fillStyle = pointerGrad;
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Pivot ruby jewel
    ctx.beginPath();
    ctx.arc(0, -5, 5.5, 0, Math.PI * 2);
    const rubyGrad = ctx.createRadialGradient(-2, -7, 1, 0, -5, 5.5);
    rubyGrad.addColorStop(0, '#FCA5A5');
    rubyGrad.addColorStop(0.5, '#DC2626');
    rubyGrad.addColorStop(1, '#7F1D1D');
    ctx.fillStyle = rubyGrad;
    ctx.fill();

    ctx.restore();
  }

  updateTargetFlags() {
    this.prizes.forEach(p => {
      p.isTarget = (p.id === this.targetPrizeId);
    });
  }

  setTargetPrize(prizeId) {
    this.targetPrizeId = prizeId;
    this.updateTargetFlags();
    this.draw();
  }

  setPrizes(prizes) {
    this.prizes = prizes;
    this.updateTargetFlags();
    this.numSlices = this.prizes.length;
    this.sliceAngle = (2 * Math.PI) / this.numSlices;
    this.draw();
  }
}
