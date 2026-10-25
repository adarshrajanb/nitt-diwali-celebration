/**
 * Main Application Orchestrator
 * Connects UI, SoundEngine, Fireworks, Canvas Wheel, One-Spin Enforcer, and Google Forms Redirect.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Configurable Google Forms Link
  const DEFAULT_REDIRECT_URL = 'https://forms.gle/diwali-nitt-movie-ticket';
  let claimRedirectUrl = localStorage.getItem('nitt_movie_ticket_url') || DEFAULT_REDIRECT_URL;

  // 2. State & Engines
  const fireworks = new FireworksEngine('fireworksCanvas');
  let redirectTimer = null;
  let redirectRemainingSeconds = 4;
  let hasUserSpun = localStorage.getItem('nitt_diwali_user_spun') === 'true';

  // 3. Elements
  const spinBtn = document.getElementById('spinBtn');
  const spinStatus = document.getElementById('spinStatus');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');

  const winnerModal = document.getElementById('winnerModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const claimRedirectLink = document.getElementById('claimRedirectLink');
  const redirectCountdown = document.getElementById('redirectCountdown');
  const redirectProgressBar = document.getElementById('redirectProgressBar');
  const cancelRedirectBtn = document.getElementById('cancelRedirectBtn');

  // Update claim link href
  if (claimRedirectLink) {
    claimRedirectLink.href = claimRedirectUrl;
  }

  // 4. Modal Close Functionality
  function closeWinnerModal() {
    winnerModal.classList.remove('active');
    stopRedirectCountdown();
  }

  modalCloseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeWinnerModal();
  });

  modalCloseBtn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    closeWinnerModal();
  });

  winnerModal.addEventListener('click', (e) => {
    if (e.target === winnerModal) {
      closeWinnerModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && winnerModal.classList.contains('active')) {
      closeWinnerModal();
    }
  });

  // 5. Dynamic Reward Spotlight updater
  function updateWonPrizeDisplay(prize) {
    if (!prize) return;
    const prizeSpotlightText = document.querySelector('.prize-spotlight-text');
    if (prizeSpotlightText) {
      prizeSpotlightText.textContent = `YOU WON: ${prize.label.toUpperCase()}!`;
    }
    const trophyBadge = document.querySelector('.trophy-badge');
    if (trophyBadge) {
      trophyBadge.textContent = `${prize.icon || '🎟️'} 🎬 🪔`;
    }
  }

  // 6. Redirect Countdown Management
  function startRedirectCountdown(seconds = 4) {
    stopRedirectCountdown();
    redirectRemainingSeconds = seconds;
    if (redirectCountdown) redirectCountdown.textContent = redirectRemainingSeconds;
    if (redirectProgressBar) {
      redirectProgressBar.style.transition = 'none';
      redirectProgressBar.style.width = '100%';

      requestAnimationFrame(() => {
        redirectProgressBar.style.transition = `width ${seconds}s linear`;
        redirectProgressBar.style.width = '0%';
      });
    }

    redirectTimer = setInterval(() => {
      redirectRemainingSeconds--;
      if (redirectRemainingSeconds > 0) {
        if (redirectCountdown) redirectCountdown.textContent = redirectRemainingSeconds;
      } else {
        stopRedirectCountdown();
        window.location.href = claimRedirectUrl;
      }
    }, 1000);
  }

  function stopRedirectCountdown() {
    if (redirectTimer) {
      clearInterval(redirectTimer);
      redirectTimer = null;
    }
    if (redirectProgressBar) {
      redirectProgressBar.style.transition = 'none';
      redirectProgressBar.style.width = '0%';
    }
  }

  if (cancelRedirectBtn) {
    cancelRedirectBtn.addEventListener('click', () => {
      stopRedirectCountdown();
      cancelRedirectBtn.textContent = '✔ Auto-redirect paused. You can click the register button anytime.';
      cancelRedirectBtn.style.color = '#81C784';
    });
  }

  if (claimRedirectLink) {
    claimRedirectLink.addEventListener('click', () => {
      stopRedirectCountdown();
    });
  }

  // 7. UI Lock for Single-Spin User
  function applyAlreadySpunUI(wonPrize) {
    const label = (wonPrize && wonPrize.label) ? wonPrize.label : 'Ticket for Movie';
    const icon = (wonPrize && wonPrize.icon) ? wonPrize.icon : '🎟️';

    spinBtn.disabled = true;
    spinBtn.classList.add('already-spun');
    spinBtn.innerHTML = `<span>ALREADY SPUN</span> <span style="font-size: 1.3rem;">✔</span>`;
    spinStatus.innerHTML = `🎉 You already spun and won: <strong>${icon} ${label}</strong>! <a href="#" id="viewRewardLink" style="color: #FFD700; text-decoration: underline; margin-left: 6px; font-weight: bold;">View Registration Form</a>`;

    const viewRewardLink = document.getElementById('viewRewardLink');
    if (viewRewardLink) {
      viewRewardLink.addEventListener('click', (e) => {
        e.preventDefault();
        openRewardModal(false);
      });
    }
  }

  function openRewardModal(autoRedirect = true) {
    winnerModal.classList.add('active');
    if (autoRedirect) {
      startRedirectCountdown(4);
    } else {
      stopRedirectCountdown();
      if (cancelRedirectBtn) {
        cancelRedirectBtn.textContent = 'Stay on homepage';
      }
    }
  }

  // 8. Initialize Wheel with dynamically loaded prizes & target winner
  const prizes = DiwaliWheel.loadPrizes();
  const targetPrizeId = DiwaliWheel.loadTargetPrizeId();

  const wheel = new DiwaliWheel('wheelCanvas', {
    prizes: prizes,
    targetPrizeId: targetPrizeId,
    onSpinStart: () => {
      spinBtn.disabled = true;
      spinBtn.innerHTML = `<span>SPINNING...</span> <span style="font-size: 1.4rem;">✨</span>`;
      spinStatus.textContent = '🌟 Hold your breath! Finding your Diwali fortune...';
      spinStatus.style.color = '#FFE082';
      window.soundEngine.playSpinStart();
    },
    onTick: (intensity) => {
      window.soundEngine.playTick(intensity);
    },
    onSpinEnd: (prize) => {
      // 1. Permanently lock spin for this user
      hasUserSpun = true;
      localStorage.setItem('nitt_diwali_user_spun', 'true');
      localStorage.setItem('nitt_diwali_won_prize', JSON.stringify({
        id: prize.id,
        label: prize.label,
        icon: prize.icon
      }));

      updateWonPrizeDisplay(prize);
      applyAlreadySpunUI(prize);

      // 2. Audio & Fireworks Celebration
      window.soundEngine.playWinFanfare();
      fireworks.startCelebration(7000);

      // 3. Open Winner Modal & start countdown
      setTimeout(() => {
        openRewardModal(true);
      }, 700);
    }
  });

  // Check if user has already spun previously
  if (hasUserSpun) {
    let savedPrize = null;
    try {
      savedPrize = JSON.parse(localStorage.getItem('nitt_diwali_won_prize'));
    } catch (e) {}

    if (!savedPrize) {
      savedPrize = wheel.prizes.find(p => p.id === wheel.targetPrizeId) || wheel.prizes[0];
    }

    wheel.setLandedOnPrize(savedPrize.id);
    updateWonPrizeDisplay(savedPrize);
    applyAlreadySpunUI(savedPrize);
  }

  // 9. Spin Button Trigger
  spinBtn.addEventListener('click', () => {
    if (hasUserSpun) {
      openRewardModal(false);
      return;
    }
    window.soundEngine.resume();
    wheel.spin();
  });

  // 10. Sound Toggle
  soundToggleBtn.addEventListener('click', () => {
    window.soundEngine.resume();
    const isMuted = window.soundEngine.toggleMute();
    soundIcon.textContent = isMuted ? '🔇' : '🔊';
  });

  // 11. Secret Shortcut for Organizers: Ctrl + Shift + D -> Navigate to Admin Subpage
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      window.location.href = 'admin.html';
    }
  });

  // 12. Info Button
  const infoBtn = document.getElementById('infoBtn');
  if (infoBtn) {
    infoBtn.addEventListener('click', () => {
      alert('🪔 Diwali Celebration\nOrganized by Cultural Council, NIT Trichy.\n\nEvery student can spin the wheel once to participate in our campus Diwali movie screening festivities!');
    });
  }
});
