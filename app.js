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

  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const adminCloseBtn = document.getElementById('adminCloseBtn');
  const claimUrlInput = document.getElementById('claimUrlInput');
  const saveAdminBtn = document.getElementById('saveAdminBtn');
  const resetSpinLockBtn = document.getElementById('resetSpinLockBtn');

  // Update claim link href
  if (claimRedirectLink) {
    claimRedirectLink.href = claimRedirectUrl;
  }
  if (claimUrlInput) {
    claimUrlInput.value = claimRedirectUrl;
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

  // 5. Redirect Countdown Management
  function startRedirectCountdown(seconds = 4) {
    stopRedirectCountdown();
    redirectRemainingSeconds = seconds;
    redirectCountdown.textContent = redirectRemainingSeconds;
    redirectProgressBar.style.transition = 'none';
    redirectProgressBar.style.width = '100%';

    requestAnimationFrame(() => {
      redirectProgressBar.style.transition = `width ${seconds}s linear`;
      redirectProgressBar.style.width = '0%';
    });

    redirectTimer = setInterval(() => {
      redirectRemainingSeconds--;
      if (redirectRemainingSeconds > 0) {
        redirectCountdown.textContent = redirectRemainingSeconds;
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

  // 6. UI Lock for Single-Spin User
  function applyAlreadySpunUI() {
    spinBtn.disabled = true;
    spinBtn.classList.add('already-spun');
    spinBtn.innerHTML = `<span>ALREADY SPUN</span> <span style="font-size: 1.3rem;">✔</span>`;
    spinStatus.innerHTML = `🎉 You already spun and won a <strong>Ticket for Movie</strong>! <a href="#" id="viewRewardLink" style="color: #FFD700; text-decoration: underline; margin-left: 6px; font-weight: bold;">View Registration Form</a>`;

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

  // 7. Initialize Wheel
  const wheel = new DiwaliWheel('wheelCanvas', {
    targetPrizeId: 'movie_ticket', // RIGGED: ALWAYS MOVIE TICKET!
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
      applyAlreadySpunUI();

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
    wheel.setLandedOnPrize('movie_ticket');
    applyAlreadySpunUI();
  }

  // 8. Spin Button Trigger
  spinBtn.addEventListener('click', () => {
    if (hasUserSpun) {
      openRewardModal(false);
      return;
    }
    window.soundEngine.resume();
    wheel.spin();
  });

  // 9. Sound Toggle
  soundToggleBtn.addEventListener('click', () => {
    window.soundEngine.resume();
    const isMuted = window.soundEngine.toggleMute();
    soundIcon.textContent = isMuted ? '🔇' : '🔊';
  });

  // 10. Organizer / Admin Controls
  adminBtn.addEventListener('click', () => {
    claimUrlInput.value = claimRedirectUrl;
    adminModal.classList.add('active');
  });

  adminCloseBtn.addEventListener('click', () => {
    adminModal.classList.remove('active');
  });

  adminModal.addEventListener('click', (e) => {
    if (e.target === adminModal) {
      adminModal.classList.remove('active');
    }
  });

  saveAdminBtn.addEventListener('click', () => {
    const newUrl = claimUrlInput.value.trim();
    if (newUrl) {
      claimRedirectUrl = newUrl;
      localStorage.setItem('nitt_movie_ticket_url', newUrl);
      if (claimRedirectLink) {
        claimRedirectLink.href = claimRedirectUrl;
      }
    }
    adminModal.classList.remove('active');
    alert('✔ Settings saved! Google Forms URL updated.');
  });

  // Reset Spin Lock (For Testing)
  if (resetSpinLockBtn) {
    resetSpinLockBtn.addEventListener('click', () => {
      localStorage.removeItem('nitt_diwali_user_spun');
      hasUserSpun = false;
      spinBtn.disabled = false;
      spinBtn.classList.remove('already-spun');
      spinBtn.innerHTML = `<span>SPIN TO WIN</span> <span style="font-size: 1.4rem;">🪔</span>`;
      spinStatus.textContent = 'Tap above to test your Diwali luck! (1 spin per user)';
      adminModal.classList.remove('active');
      alert('🔄 Spin Lock Reset! You can now spin the wheel again for testing.');
    });
  }

  // Secret Shortcut: Ctrl + Shift + D
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      e.preventDefault();
      claimUrlInput.value = claimRedirectUrl;
      adminModal.classList.toggle('active');
    }
  });

  // Info Button
  const infoBtn = document.getElementById('infoBtn');
  if (infoBtn) {
    infoBtn.addEventListener('click', () => {
      alert('🪔 Diwali Celebration\nOrganized by Cultural Council, NIT Trichy.\n\nEvery student can spin the wheel once to participate in our campus Diwali movie screening festivities!');
    });
  }
});
